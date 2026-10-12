import { bcs } from '@mysten/sui/bcs';
import type { SuiClientTypes } from '@mysten/sui/client';
import { fromBase64, normalizeStructTag } from '@mysten/sui/utils';
import { client } from './suiClient';

// Layouts follow contract/brag.move. BCS avoids transport-specific JSON shapes.
export const PokerData = bcs.struct('PokerData', {
  id: bcs.Address,
  balance: bcs.u64(),
  player1: bcs.Address,
  player2: bcs.Address,
  sigcards1: bcs.vector(bcs.u8()),
  sigcards2: bcs.vector(bcs.u8()),
  revealcards1: bcs.vector(bcs.u8()),
  revealcards2: bcs.vector(bcs.u8()),
  stage: bcs.u8(),
  bet: bcs.u64(),
  min_bet: bcs.u64(),
  max_bet: bcs.u64(),
  time: bcs.u64(),
  vip_p1: bcs.bool(),
  vip_p2: bcs.bool(),
  action: bcs.bool(),
});

const RoomEvent = bcs.struct('RoomEvent', {
  result: bcs.u64(), vol: bcs.u64(), maxvol: bcs.u64(),
});
const CloseEvent = bcs.struct('CloseEvent', { result: bcs.u64() });
const VolumeEvent = bcs.struct('VolumeEvent', {
  vol: bcs.u64(), player: bcs.Address, expendORincome: bcs.bool(),
});
const KioskOwnerCap = bcs.struct('KioskOwnerCap', { id: bcs.Address, for: bcs.Address });

export function decodeBragEvent(event: SuiClientTypes.Event): Record<string, unknown> {
  const name = event.eventType.split('::')[2]?.split('<')[0];
  switch (name) {
    case 'GnumberOpen':
    case 'GnumberCont': return RoomEvent.parse(event.bcs);
    case 'GnumberClose': return CloseEvent.parse(event.bcs);
    case 'Gvol': return VolumeEvent.parse(event.bcs);
    default: return event.json ?? {};
  }
}

export function requireSuccess<I extends SuiClientTypes.TransactionInclude>(
  result: SuiClientTypes.TransactionResult<I>,
): SuiClientTypes.Transaction<I> {
  if (result.$kind === 'FailedTransaction') {
    throw new Error(`Transaction failed: ${JSON.stringify(result.FailedTransaction.status)}`);
  }
  return result.Transaction;
}

const timestamps = new Map<string, number>();
async function eventTimestamp(digest: string) {
  const cached = timestamps.get(digest);
  if (cached !== undefined) return cached;
  const result = await client.getTransaction({ digest });
  const tx = result.Transaction ?? result.FailedTransaction;
  const timestamp = tx.timestampMs;
  if (timestamp === null) throw new Error(`Transaction ${digest} has no checkpoint timestamp yet`);
  if (timestamps.size >= 1000) timestamps.delete(timestamps.keys().next().value!);
  timestamps.set(digest, timestamp);
  return timestamp;
}

export async function queryBragEvents(eventType: string, limit = 120) {
  const events: SuiClientTypes.EventEntry[] = [];
  let before: string | null = null;
  do {
    const page = await client.listEvents({
      filter: { eventType }, order: 'descending', before,
      limit: Math.min(50, limit - events.length),
    });
    events.push(...page.events);
    if (!page.hasNextPage) break;
    if (!page.endCursor || page.endCursor === before) throw new Error('Event cursor did not advance');
    before = page.endCursor;
  } while (events.length < limit);

  // Resolve timestamps with bounded concurrency; gRPC events only carry a checkpoint/digest.
  const data: { timestampMs: string; parsedJson: Record<string, unknown>; id: { txDigest: string; eventSeq: string } }[] = [];
  for (let i = 0; i < events.length; i += 6) {
    data.push(...await Promise.all(events.slice(i, i + 6).map(async (event) => ({
      timestampMs: String(await eventTimestamp(event.transactionDigest)),
      parsedJson: decodeBragEvent(event),
      id: { txDigest: event.transactionDigest, eventSeq: String(event.eventIndex) },
    }))));
  }
  return { data };
}

export async function getRoom(parentId: string, room: number | string) {
  const { object } = await client.getDynamicObjectField({
    parentId, name: { type: 'u64', bcs: bcs.u64().serialize(room).toBytes() },
    include: { content: true },
  });
  return PokerData.parse(object.content);
}

export async function getCoins(owner: string, coinType: string) {
  const coins: SuiClientTypes.Coin[] = [];
  let cursor: string | null = null;
  do {
    const page = await client.listCoins({ owner, coinType, cursor });
    coins.push(...page.objects);
    if (!page.hasNextPage) break;
    if (!page.cursor || page.cursor === cursor) throw new Error('Coin cursor did not advance');
    cursor = page.cursor;
  } while (true);
  if (!coins.length) throw new Error('No spendable coins found for this token');
  return coins;
}

export async function findKioskNFT(owner: string, nftType: string): Promise<[string, string] | false> {
  let cursor: string | null = null;
  do {
    const caps = await client.listOwnedObjects({
      owner, type: '0x2::kiosk::KioskOwnerCap', include: { content: true }, cursor,
    });
    for (const cap of caps.objects) {
      const kioskID = KioskOwnerCap.parse(cap.content).for;
      let fieldCursor: string | null = null;
      do {
        const page = await client.listDynamicFields({ parentId: kioskID, cursor: fieldCursor });
        for (const field of page.dynamicFields) {
          if (field.$kind === 'DynamicObject' && normalizeStructTag(field.valueType) === normalizeStructTag(nftType)) {
            return [kioskID, field.childId];
          }
        }
        if (!page.hasNextPage) break;
        if (!page.cursor || page.cursor === fieldCursor) throw new Error('Dynamic field cursor did not advance');
        fieldCursor = page.cursor;
      } while (true);
    }
    if (!caps.hasNextPage) break;
    if (!caps.cursor || caps.cursor === cursor) throw new Error('Owned object cursor did not advance');
    cursor = caps.cursor;
  } while (true);
  return false;
}

// Resolve arguments from the Move call instead of assuming fixed PTB input positions.
export function readOpenCards(transaction: SuiClientTypes.TransactionData, packageId: string, room: number) {
  for (const command of transaction.commands) {
    if (!('MoveCall' in command)) continue;
    const call = command.MoveCall;
    if (!call || call.package !== packageId || call.module !== 'brag' || call.function !== 'OpenCards') continue;
    const [roomArg, cardsArg] = call.arguments;
    if (!roomArg || !cardsArg || !('Input' in roomArg) || !('Input' in cardsArg)) continue;
    const roomInput = transaction.inputs[roomArg.Input];
    const cardsInput = transaction.inputs[cardsArg.Input];
    if (!roomInput || !cardsInput || !('Pure' in roomInput) || !('Pure' in cardsInput)) continue;
    if (bcs.u64().parse(fromBase64(roomInput.Pure.bytes)) !== String(room)) continue;
    return [bcs.vector(bcs.u8()).parse(fromBase64(cardsInput.Pure.bytes)), transaction.sender] as const;
  }
}

export async function findOpenCards(packageId: string, room: number) {
  let before: string | null = null;
  let checked = 0;
  do {
    const page = await client.listTransactions({
      filter: { function: `${packageId}::brag::OpenCards` },
      order: 'descending', before, limit: 12 - checked, include: { transaction: true },
    });
    for (const result of page.transactions) {
      checked++;
      if (result.$kind !== 'Transaction') continue;
      const cards = readOpenCards(result.Transaction.transaction, packageId, room);
      if (cards) return cards;
    }
    if (!page.hasNextPage) break;
    if (!page.endCursor || page.endCursor === before) throw new Error('Transaction cursor did not advance');
    before = page.endCursor;
  } while (checked < 12);
}
