import assert from 'node:assert/strict';
import { test } from 'node:test';
import { recentBets, toBet } from '../src/betHistory';

const event = (sequence: string, income = false, vol = '1000000000') => ({
  timestampMs: '1772856054517',
  parsedJson: { player: '0x123', vol, expendORincome: income },
  id: { txDigest: 'same-transaction', eventSeq: sequence },
});

test('keeps distinct events in the same transaction while removing exact duplicates', () => {
  const wager = toBet(event('0'), 'sui', 9);
  const payout = toBet(event('1', true, '1990000000'), 'sui', 9);
  const rows = recentBets([wager, payout, wager]);
  assert.equal(rows.length, 2);
  assert.equal(wager.wager, '1.00');
  assert.equal(wager.profit, '--');
  assert.equal(payout.profit, '1.99');
  assert.equal(payout.wager, '--');
  assert.equal(payout.multiplier, '--');
});

test('formats USDC and large u64 amounts without floating-point rounding', () => {
  assert.equal(toBet(event('0', false, '1239999'), 'usdc', 6).wager, '1.23');
  assert.equal(toBet(event('0', false, '18446744073709551615'), 'sui', 9).wager, '18446744073.70');
});

test('sorts merged token history newest-first and applies the total row limit', () => {
  const older = { ...toBet(event('0'), 'sui', 9), time: 1 };
  const newer = { ...toBet(event('1'), 'usdc', 6), time: 2 };
  assert.deepEqual(recentBets([older, newer], 1), [newer]);
});
