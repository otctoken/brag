import { bcs } from '@mysten/sui/bcs';
import { normalizeStructTag } from '@mysten/sui/utils';
import { client } from './suiClient';
import { PokerData } from './bragChain';
import { MODULE, TOKENS, type Token, type TableRef } from './gameConfig';
import { type Room } from './gameRules';

export interface LobbyTable extends TableRef { room: Room }
export const isMissingRoom = (error: unknown) => /not.?found|does not exist|deleted/i.test(error instanceof Error ? error.message : String(error));

// Current dynamic objects are authoritative. Old Close events mean a table was
// joined, not that every subsequent round at that number must stay hidden.
export async function listTables(token: Token, signal?: AbortSignal): Promise<LobbyTable[]> {
  const config = TOKENS[token];
  const tables: LobbyTable[] = [];
  let cursor: string | null = null;
  do {
    const page = await client.listDynamicFields({ parentId: config.game, cursor, limit: 50, signal });
    const fields = page.dynamicFields.filter(field => field.$kind === 'DynamicObject'
      && normalizeStructTag(field.valueType) === normalizeStructTag(`${MODULE}::PokerData<${config.type}>`));
    if (fields.length) {
      const result = await client.getObjects({ objectIds: fields.map(field => field.childId!), include: { content: true }, signal });
      for (let i = 0; i < fields.length; i++) {
        const object = result.objects[i];
        if (object instanceof Error && isMissingRoom(object)) continue; // Deleted during the scan.
        if (!object || object instanceof Error) throw object ?? new Error('Incomplete table response');
        // dynamic_object_field::Wrapper<u64> has the same BCS bytes as its u64 name.
        tables.push({ token, number: bcs.u64().parse(fields[i].name.bcs), room: PokerData.parse(object.content) });
      }
    }
    if (!page.hasNextPage) break;
    if (!page.cursor || page.cursor === cursor) throw new Error('Table cursor did not advance');
    cursor = page.cursor;
  } while (true);
  return tables.sort((a, b) => BigInt(a.number) > BigInt(b.number) ? -1 : 1);
}

const GameData = bcs.struct('GameData', {
  id: bcs.Address, balance: bcs.u64(), fee: bcs.u8(), vip_fee: bcs.u8(), countdown: bcs.u64(), gamenumber: bcs.u64(),
});
const Clock = bcs.struct('Clock', { id: bcs.Address, timestamp_ms: bcs.u64() });
export async function getTiming(token: Token) {
  const [game, clock] = await Promise.all([
    client.getObject({ objectId: TOKENS[token].game, include: { content: true } }),
    client.getObject({ objectId: '0x6', include: { content: true } }),
  ]);
  return { countdown: Number(GameData.parse(game.object.content).countdown),
    chainTime: Number(Clock.parse(clock.object.content).timestamp_ms), sampledAt: performance.now() };
}
