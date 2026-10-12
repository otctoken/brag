import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { client } from '../src/suiClient';
import { decodeBragEvent, findKioskNFT, getCoins, getRoom, queryBragEvents, readOpenCards, requireSuccess } from '../src/bragChain';

afterEach(() => mock.restoreAll());

const packageId = normalizeSuiAddress('0x123');
const eventType = `${packageId}::brag::GnumberOpen<0x2::sui::SUI>`;
const eventBytes = bcs.struct('GnumberOpen', {
  result: bcs.u64(), vol: bcs.u64(), maxvol: bcs.u64(),
}).serialize({ result: '9007199254740993', vol: 10, maxvol: 100 }).toBytes();
const event = {
  packageId, module: 'brag', sender: normalizeSuiAddress('0x1'), eventType,
  bcs: eventBytes, json: null, checkpoint: '1', transactionDigest: 'test-digest', eventIndex: 0,
};

test('decodes Move events without JSON and preserves u64 precision', () => {
  assert.deepEqual(decodeBragEvent(event), { result: '9007199254740993', vol: '10', maxvol: '100' });
});

test('event pagination continues through empty scan-limited pages and resolves real timestamps', async () => {
  const requests: any[] = [];
  mock.method(client, 'listEvents', async (options: any) => {
    requests.push(options);
    return requests.length === 1
      ? { events: [], hasNextPage: true, endCursor: 'scan-cursor' }
      : { events: [event], hasNextPage: false, endCursor: 'end' };
  });
  mock.method(client, 'getTransaction', async () => ({ $kind: 'Transaction', Transaction: { timestampMs: 1234 } }));
  const result = await queryBragEvents(eventType);
  assert.equal(requests[0].order, 'descending');
  assert.equal(requests[0].limit, 50);
  assert.equal(requests[1].before, 'scan-cursor');
  assert.equal(result.data[0].timestampMs, '1234');
  assert.equal(result.data[0].id.txDigest, 'test-digest');
});

test('stops a broken pagination cursor instead of looping forever', async () => {
  mock.method(client, 'listEvents', async () => ({ events: [], hasNextPage: true, endCursor: 'same' }));
  await assert.rejects(queryBragEvents(eventType), /cursor did not advance/);
});

test('collects all coin pages and reports no spendable coins', async () => {
  mock.method(client, 'listCoins', async ({ cursor }: any) => cursor
    ? { objects: [{ objectId: 'second' }], hasNextPage: false, cursor: null }
    : { objects: [{ objectId: 'first' }], hasNextPage: true, cursor: 'next' });
  assert.deepEqual((await getCoins('owner', 'coin')).map(c => c.objectId), ['first', 'second']);
  mock.restoreAll();
  mock.method(client, 'listCoins', async () => ({ objects: [], hasNextPage: false }));
  await assert.rejects(getCoins('owner', 'coin'), /No spendable coins/);
});

test('reads a dynamic object using a BCS u64 key and decodes the contract layout', async () => {
  // Independent layout using the exact field order in contract/brag.move.
  const bytes = bcs.struct('PokerData', {
    id: bcs.Address, balance: bcs.u64(), player1: bcs.Address, player2: bcs.Address,
    sigcards1: bcs.vector(bcs.u8()), sigcards2: bcs.vector(bcs.u8()),
    revealcards1: bcs.vector(bcs.u8()), revealcards2: bcs.vector(bcs.u8()),
    stage: bcs.u8(), bet: bcs.u64(), min_bet: bcs.u64(), max_bet: bcs.u64(), time: bcs.u64(),
    vip_p1: bcs.bool(), vip_p2: bcs.bool(), action: bcs.bool(),
  }).serialize({
    id: '0x3', balance: 10, player1: '0x1', player2: '0x2', sigcards1: [1, 255], sigcards2: [],
    revealcards1: [0, 20, 51], revealcards2: [], stage: 6, bet: 100, min_bet: 10,
    max_bet: 1000, time: '1700000000000', vip_p1: true, vip_p2: false, action: true,
  }).toBytes();
  mock.method(client, 'getDynamicObjectField', async (options: any) => {
    assert.equal(options.parentId, 'parent');
    assert.equal(options.name.type, 'u64');
    assert.equal(bcs.u64().parse(options.name.bcs), '42');
    return { object: { content: bytes } };
  });
  const room = await getRoom('parent', 42);
  assert.deepEqual(room.revealcards1, [0, 20, 51]);
  assert.equal(room.stage, 6);
  assert.equal(room.max_bet, '1000');
  assert.equal(room.player1, normalizeSuiAddress('0x1'));
});

test('kiosk lookup paginates caps and fields and returns the child NFT, not its wrapper', async () => {
  const cap = bcs.struct('KioskOwnerCap', { id: bcs.Address, for: bcs.Address })
    .serialize({ id: '0x1', for: '0x2' }).toBytes();
  mock.method(client, 'listOwnedObjects', async ({ cursor }: any) => cursor
    ? { objects: [{ content: cap }], hasNextPage: false }
    : { objects: [], hasNextPage: true, cursor: 'caps-next' });
  mock.method(client, 'listDynamicFields', async ({ cursor }: any) => cursor
    ? { dynamicFields: [{ $kind: 'DynamicObject', valueType: '0x3::nft::NFT', childId: 'nft', fieldId: 'wrapper' }], hasNextPage: false }
    : { dynamicFields: [], hasNextPage: true, cursor: 'fields-next' });
  assert.deepEqual(await findKioskNFT('owner', '0x3::nft::NFT'), [normalizeSuiAddress('0x2'), 'nft']);
});

test('OpenCards decoding follows Move arguments even when input positions change', () => {
  const tx = new Transaction();
  tx.setSender('0x9');
  tx.pure.u8(99); // Unrelated input inserted before the call.
  tx.moveCall({ target: `${packageId}::brag::OpenCards`, arguments: [
    tx.pure.u64(42), tx.pure.vector('u8', [0, 128, 255]), tx.pure.vector('u8', [1]), tx.object('0x4'),
  ] });
  const data = tx.getData();
  assert.deepEqual(readOpenCards(data, packageId, 42), [[0, 128, 255], normalizeSuiAddress('0x9')]);
  assert.equal(readOpenCards(data, packageId, 43), undefined);
});

test('failed transactions throw before the UI handles events as success', () => {
  assert.throws(() => requireSuccess({ $kind: 'FailedTransaction', FailedTransaction: {
    status: { success: false, error: { message: 'MoveAbort' } },
  } } as any), /Transaction failed.*MoveAbort/);
});
