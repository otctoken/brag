import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { afterEach, mock, test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { fromBase64, normalizeStructTag, normalizeSuiAddress } from '@mysten/sui/utils';
import { toBaseUnits } from '../src/coinAmount';
import { client } from '../src/suiClient';

afterEach(() => mock.restoreAll());

const source = ts.createSourceFile('TeenPatti.tsx', readFileSync(
  new URL('../src/components/TeenPatti.tsx', import.meta.url), 'utf8',
), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const declarations = new Map<string, string>();
function collect(node: ts.Node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
    declarations.set(node.name.text, node.initializer.getText(source));
  }
  ts.forEachChild(node, collect);
}
collect(source);

const sui = '0x2::sui::SUI';
const usdc = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';

// Execute the actual page handlers in isolation: JSX assets, rendering, wallet
// signatures and game randomness are outside this transaction-construction test.
async function runAction(
  name: string,
  selected: 'sui' | 'usdc',
  args: unknown[] = [],
  overrides: Record<string, unknown> = {},
  serialize?: (transaction: Transaction) => Promise<void>,
) {
  const transactions: Transaction[] = [];
  const errors: unknown[] = [];
  const scope: Record<string, unknown> = {
    Transaction, toBaseUnits,
    looksui: true, selected, decimals: selected === 'sui' ? 1e9 : 1e6,
    ante: 1.001, maxbet: 10, betRasie: 1.001, betsui: 10000001,
    lookCard: true, roomNum: 42, iputRoomNum: 43,
    kiosk: '0x4', nftid: '0x5', randomPoker: [1, 2, 3], randomKey: 'key',
    setLooksui() {}, setAnte() {},
    gettRandomPoker: () => [1, 2, 3], gettRandomKey: () => 'key',
    bls12_381: { sign: () => new Uint8Array([1, 2, 3]), getPublicKey: () => new Uint8Array([4, 5, 6]) },
    window: { alert: (message: string) => errors.push(message) },
    console: { log: (error: unknown) => errors.push(error) },
    executeTransaction: async ({ transaction }: { transaction: Transaction }) => {
      transactions.push(transaction);
      transaction.setSender('0x123');
      if (serialize) await serialize(transaction);
      return {}; // Stop before unrelated UI event handling.
    },
    ...overrides,
  };
  for (const constant of ['CoinSui', 'CoinUsdc', 'Gamedata', 'Gamedata_USDC', 'Package_TeenPatti', 'NFTOB', 'clockob', 'MINcoin', 'MAXcoin', 'neting']) {
    scope[constant] = runInNewContext(declarations.get(constant)!);
  }
  const initializer = declarations.get(name);
  assert.ok(initializer, `Missing page action ${name}`);
  const compiled = ts.transpileModule(`(${initializer})`, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
  } }).outputText;
  await runInNewContext(compiled, scope)(...args);
  return { transactions, errors, scope };
}

test('token scaling preserves fractional amounts, scientific notation and u64 precision', () => {
  assert.equal(toBaseUnits(1.001, 1e9), 1001000000n);
  assert.equal(toBaseUnits(1.001, 1e6), 1001000n);
  assert.equal(toBaseUnits(1e-9, 1e9), 1n);
  assert.equal(toBaseUnits('9007199.254740993', 1e9), 9007199254740993n);
  assert.equal(toBaseUnits('18446744073.709551615', 1e9), 18446744073709551615n);
  for (const amount of [-1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '1e-10', '18446744073.709551616']) {
    assert.throws(() => toBaseUnits(amount, 1e9));
  }
});

const cases = [
  { name: 'transferSui_create_game', target: 'create_game', coinIndex: 2, length: 6 },
  { name: 'transferSui_join', target: 'join_game', coinIndex: 2, length: 7 },
  { name: 'transferSui_join', target: 'join_playing', coinIndex: 2, length: 7 },
  { name: 'transferSui_call', target: 'call', coinIndex: 1, length: 4 },
  { name: 'transferSui_rasie', target: 'rasie', coinIndex: 1, length: 4 },
  { name: 'transferSui_applyOpenCards', target: 'applyOpenCards', coinIndex: 3, length: 6 },
  { name: 'transferSui_go_on_playing____', target: 'go_on_playing', coinIndex: 2, length: 4 },
  { name: 'transferSui_join_playing____', target: 'join_playing', coinIndex: 2, length: 5 },
];

for (const selected of ['sui', 'usdc'] as const) {
  for (const action of cases) {
    test(`${selected}: ${action.name}/${action.target} passes the correct coin into the original Move call`, async () => {
      const isJoin = action.name === 'transferSui_join';
      const args = isJoin ? ['10000001', 42, action.target === 'join_playing' ? 1 : 0, selected] : [];
      const { transactions, errors, scope } = await runAction(action.name, selected, args,
        // Joining must follow the room's token, even if the page selected the other one.
        isJoin ? { selected: selected === 'sui' ? 'usdc' : 'sui' } : {});
      assert.deepEqual(errors, []);
      assert.equal(transactions.length, 1);
      const data = Transaction.from(await transactions[0].toJSON({ supportedIntents: ['CoinWithBalance'] })).getData();
      const intentIndex = data.commands.findIndex(command => command.$Intent?.name === 'CoinWithBalance');
      assert.ok(intentIndex >= 0);
      const intent = data.commands[intentIndex].$Intent!;
      const expected = isJoin || action.target === 'call' ? 10000001n
        : action.target === 'applyOpenCards' ? 20000002n
        : selected === 'sui' ? 1001000000n : 1001000n;
      assert.equal(BigInt(intent.data.balance as string), expected);
      assert.equal(intent.data.type, selected === 'sui' ? 'gas' : normalizeStructTag(usdc));
      const call = data.commands.find(command => command.MoveCall?.function === action.target)?.MoveCall;
      assert.ok(call);
      assert.equal(normalizeStructTag(call.typeArguments[0]), normalizeStructTag(selected === 'sui' ? sui : usdc));
      assert.equal(call.arguments.length, action.length);
      assert.equal(call.arguments[action.coinIndex].Result, intentIndex);
      const gameId = normalizeSuiAddress(String(scope[selected === 'sui' ? 'Gamedata' : 'Gamedata_USDC']));
      assert.ok(call.arguments.some(arg => arg.Input !== undefined && data.inputs[arg.Input].UnresolvedObject?.objectId === gameId));
      if (action.target === 'create_game') {
        assert.equal(bcs.u64().parse(fromBase64(data.inputs[call.arguments[1].Input!].Pure!.bytes)), selected === 'sui' ? '10000000000' : '10000000');
      }
    });
  }
}

test('blind call and showdown retain their half/full bet rules', async () => {
  for (const [name, expected] of [['transferSui_call', 5000000n], ['transferSui_applyOpenCards', 10000001n]] as const) {
    const { transactions, errors } = await runAction(name, 'sui', [], { lookCard: false });
    assert.deepEqual(errors, []);
    const intent = transactions[0].getData().commands.find(command => command.$Intent)?.$Intent;
    assert.equal(intent?.data.balance, expected);
  }
});

for (const addressOnly of [false, true]) {
  test(`actual USDC action resolves ${addressOnly ? 'address-only funds' : 'fragmented coins across pages'} for the wallet`, async () => {
    mock.method(client.core, 'getBalance', async () => ({ balance: {
      balance: '2000000', addressBalance: addressOnly ? '2000000' : '0', coinBalance: addressOnly ? '0' : '2000000',
    } }));
    const list = mock.method(client.core, 'listCoins', async ({ cursor }: { cursor: string | null }) => ({
      objects: addressOnly ? [] : [{ objectId: normalizeSuiAddress(cursor ? '0x101' : '0x100'),
        balance: '1000000', version: '1', digest: '11111111111111111111111111111111' }],
      hasNextPage: !addressOnly && !cursor, cursor: !addressOnly && !cursor ? 'next' : null,
    }));
    const { errors } = await runAction('transferSui_rasie', 'usdc', [], {}, async transaction => {
      const resolved = Transaction.from(await transaction.toJSON({ client })).getData();
      assert.ok(resolved.commands.every(command => !command.$Intent));
      assert.equal(resolved.inputs.some(input => input.FundsWithdrawal), addressOnly);
      const splitIndex = resolved.commands.findIndex(command => command.SplitCoins);
      const call = resolved.commands.find(command => command.MoveCall?.function === 'rasie')!.MoveCall!;
      assert.deepEqual(call.arguments[1].NestedResult, [splitIndex, 0]);
    });
    assert.deepEqual(errors, []);
    assert.equal(list.mock.callCount(), addressOnly ? 1 : 2);
  });
}

for (const addressOnly of [false, true]) {
  test(`SUI action resolves ${addressOnly ? 'address balance' : 'gas coin fallback'} during wallet serialization`, async () => {
    mock.method(client.core, 'getBalance', async () => ({ balance: {
      balance: '20000000', addressBalance: addressOnly ? '20000000' : '0', coinBalance: addressOnly ? '0' : '20000000',
    } }));
    mock.method(client.core, 'listCoins', async () => { throw new Error('Must not manually select SUI gas coins'); });
    const { errors } = await runAction('transferSui_call', 'sui', [], {}, async transaction => {
      const resolved = Transaction.from(await transaction.toJSON({ client })).getData();
      assert.ok(resolved.commands.every(command => !command.$Intent));
      const splitIndex = resolved.commands.findIndex(command => command.SplitCoins);
      assert.equal(resolved.commands[splitIndex].SplitCoins!.coin.$kind, addressOnly ? 'Result' : 'GasCoin');
      assert.equal(resolved.inputs.some(input => input.FundsWithdrawal), addressOnly);
      const call = resolved.commands.find(command => command.MoveCall?.function === 'call')!.MoveCall!;
      assert.deepEqual(call.arguments[1].NestedResult, [splitIndex, 0]);
    });
    assert.deepEqual(errors, []);
  });
}

test('insufficient USDC cannot finish preparing a wallet transaction', async () => {
  mock.method(client.core, 'getBalance', async () => ({ balance: { balance: '0', addressBalance: '0', coinBalance: '0' } }));
  mock.method(client.core, 'listCoins', async () => ({ objects: [], hasNextPage: false, cursor: null }));
  let prepared = false;
  const { errors } = await runAction('transferSui_rasie', 'usdc', [], {}, async transaction => {
    await transaction.toJSON({ client });
    prepared = true;
  });
  assert.equal(prepared, false);
  assert.equal(errors.length, 1);
  assert.match(String(errors[0]), /Insufficient balance/);
});
