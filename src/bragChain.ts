import { bcs } from '@mysten/sui/bcs';
import type { SuiClientTypes } from '@mysten/sui/client';
import { fromBase64, normalizeStructTag } from '@mysten/sui/utils';
import { graphql } from '@mysten/sui/graphql/schema';
import { client } from './suiClient';
import { historyClient } from './historyClient';

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

export function decodeBragEvent(event: Pick<SuiClientTypes.Event, 'eventType' | 'bcs' | 'json'>): Record<string, unknown> {
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

const historyEventsQuery = graphql(`
  query BragHistoryEvents($type: String!, $last: Int!, $before: String) {
    events(filter: { type: $type }, last: $last, before: $before) {
      pageInfo { hasPreviousPage startCursor }
      nodes {
        sequenceNumber
        timestamp
        transaction { digest }
        contents { type { repr } bcs }
      }
    }
  }
`);

export interface BragHistoryEvent {
  timestampMs: string;
  parsedJson: Record<string, unknown>;
  id: { txDigest: string; eventSeq: string };
}

export async function queryBragEvents(eventType: string, limit = 120, signal?: AbortSignal) {
  const data: BragHistoryEvent[] = [];
  let before: string | null = null;
  while (data.length < limit) {
    // Fetch timestamps together with events instead of issuing one extra RPC per row.
    const result = await historyClient.query({
      query: historyEventsQuery,
      variables: { type: normalizeStructTag(eventType), last: Math.min(50, limit - data.length), before },
      signal,
    });
    if (result.errors?.length) throw new Error(result.errors.map(error => error.message).join('; '));
    const page = result.data?.events;
    if (!page) throw new Error('History response is missing events');
    // GraphQL last/before pages arrive oldest-first; reverse each page for newest-first history.
    for (const event of [...page.nodes].reverse()) {
      const digest = event.transaction?.digest;
      const timestamp = event.timestamp ? Date.parse(event.timestamp) : NaN;
      const contents = event.contents;
      if (!digest || !Number.isFinite(timestamp) || !contents?.bcs || !contents.type?.repr) {
        throw new Error('History event is missing its digest, timestamp or contents');
      }
      data.push({
        timestampMs: String(timestamp),
        parsedJson: decodeBragEvent({ eventType: contents.type.repr, bcs: fromBase64(contents.bcs), json: null }),
        id: { txDigest: digest, eventSeq: String(event.sequenceNumber) },
      });
    }
    if (!page.pageInfo.hasPreviousPage) break;
    if (!page.pageInfo.startCursor || page.pageInfo.startCursor === before) throw new Error('Event cursor did not advance');
    before = page.pageInfo.startCursor;
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
    const page = await historyClient.listTransactions({
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
