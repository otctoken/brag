import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { fromBase64, normalizeStructTag, normalizeSuiAddress } from '@mysten/sui/utils';
import { toBaseUnits } from '../src/coinAmount';
import { client } from '../src/suiClient';
import { buildGameTransaction, type ActionRequest } from '../src/gameTransactions';
import { TOKENS, type Token } from '../src/gameConfig';
import { signature, type RoundSecret } from '../src/gameSecrets';
import { type Room, type GameAction } from '../src/gameRules';

afterEach(() => mock.restoreAll());
const A = normalizeSuiAddress('0x123'), B = normalizeSuiAddress('0x456');
const secret: RoundSecret = { key: '1'.padStart(64, '0'), cards: [...Array.from({length:52}, (_, i) => i + 1), 0, 20, 51] };
const baseRoom: Room = { id: normalizeSuiAddress('0x3'), balance: '20000002', player1: A, player2: B, sigcards1: signature(secret), sigcards2: [2], revealcards1: [], revealcards2: [0,20,51], stage: 0, bet: '10000001', min_bet: '10000', max_bet: '10000000000', time: '1000', vip_p1: false, vip_p2: false, action: false };
function request(action: GameAction, token: Token, overrides: Partial<ActionRequest> = {}): ActionRequest {
  const room = { ...baseRoom };
  let amount = toBaseUnits('1.001', TOKENS[token].scale);
  let address = A;
  if (action === 'join_playing') { room.stage = 10; room.player2 = normalizeSuiAddress('0x0'); address = B; amount = BigInt(room.bet); }
  if (action === 'go_on_playing') room.stage = 11;
  if (action === 'call') amount = BigInt(room.bet);
  if (action === 'applyOpenCards') amount = BigInt(room.bet) * 2n;
  if (action === 'rasie') { room.bet = '1000000'; }
  return { action, token, address, number: '42', room, amount, maxBet: toBaseUnits('10', TOKENS[token].scale), secret, kiosk: '0x4', nft: '0x5', ...overrides };
}

test('token scaling preserves fractional amounts, scientific notation and u64 precision', () => {
  assert.equal(toBaseUnits(1.001, 1e9), 1001000000n);
  assert.equal(toBaseUnits(1.001, 1e6), 1001000n);
  assert.equal(toBaseUnits(1e-9, 1e9), 1n);
  assert.equal(toBaseUnits('9007199.254740993', 1e9), 9007199254740993n);
  assert.equal(toBaseUnits('18446744073.709551615', 1e9), 18446744073709551615n);
  for (const amount of [-1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '1e-10', '18446744073.709551616']) assert.throws(() => toBaseUnits(amount, 1e9));
});
const funded = [
  { action: 'create_game', coinIndex: 2, length: 6 },
  { action: 'join_playing', coinIndex: 2, length: 7 },
  { action: 'call', coinIndex: 1, length: 4 },
  { action: 'rasie', coinIndex: 1, length: 4 },
  { action: 'applyOpenCards', coinIndex: 3, length: 6 },
  { action: 'go_on_playing', coinIndex: 2, length: 4 },
] as const;
for (const token of ['sui', 'usdc'] as const) {
  for (const { action, coinIndex, length } of funded) {
    test(`${token}: ${action} matches the Move ABI and exact payment`, async () => {
      const input = request(action, token);
      const tx = buildGameTransaction(input);
      const data = Transaction.from(await tx.toJSON({ supportedIntents: ['CoinWithBalance'] })).getData();
      const intentIndex = data.commands.findIndex(command => command.$Intent?.name === 'CoinWithBalance');
      const intent = data.commands[intentIndex].$Intent!;
      assert.equal(BigInt(intent.data.balance as string), input.amount);
      assert.equal(intent.data.type, token === 'sui' ? 'gas' : normalizeStructTag(TOKENS.usdc.type));
      const call = data.commands.find(command => command.MoveCall?.function === action)!.MoveCall!;
      assert.equal(call.arguments.length, length);
      assert.equal(call.arguments[coinIndex].Result, intentIndex);
      assert.equal(normalizeStructTag(call.typeArguments[0]), normalizeStructTag(TOKENS[token].type));
      assert.ok(data.inputs.some(arg => arg.UnresolvedObject?.objectId === TOKENS[token].game));
      if (action === 'create_game') assert.equal(bcs.u64().parse(fromBase64(data.inputs[call.arguments[1].Input!].Pure!.bytes)), String(input.maxBet));
      if (action === 'join_playing') {
        assert.equal(data.inputs[call.arguments[5].Input!].UnresolvedObject?.objectId, normalizeSuiAddress('0x4'));
        assert.equal(bcs.Address.parse(fromBase64(data.inputs[call.arguments[6].Input!].Pure!.bytes)), normalizeSuiAddress('0x5'));
      }
    });
  }
}

test('blind call floors odd base units; blind showdown uses the full bet without rounding', () => {
  const blind = { ...baseRoom, revealcards2: [] };
  for (const [action, amount] of [['call', 5000000n], ['applyOpenCards', 10000001n]] as const) {
    const tx = buildGameTransaction(request(action, 'sui', { room: blind, amount }));
    assert.equal(tx.getData().commands.find(c => c.$Intent)?.$Intent?.data.balance, amount);
  }
});

test('reveal, settlement, timeout and close actions use the correct ABI', () => {
  for (const [action, stage, count] of [['apply_look_cards',0,3],['reveal_look_cards',6,4],['OpenCards',4,4],['fold',0,3],['get_fold_bets',5,4],['get_timeout_bets',0,3],['leave_game',10,2]] as const) {
    const room = { ...baseRoom, stage, revealcards2: [], action: action === 'get_timeout_bets' };
    const tx = buildGameTransaction(request(action,'sui',{room,now:62000,countdown:60000}));
    assert.equal(tx.getData().commands[0].MoveCall?.arguments.length, count);
  }
});

test('invalid amounts, stale ante, self-join, wrong turn and wrong-round secrets stop before signing', () => {
  assert.throws(() => buildGameTransaction(request('create_game','sui',{amount:0n})), /positive ante/);
  assert.throws(() => buildGameTransaction(request('join_playing','sui',{amount:1n})), /ante changed/);
  assert.throws(() => buildGameTransaction(request('join_playing','sui',{address:A})), /already seated/);
  assert.throws(() => buildGameTransaction(request('call','sui',{room:{...baseRoom,action:true}})), /not your turn/);
  assert.throws(() => buildGameTransaction(request('applyOpenCards','sui',{secret:{...secret,key:'2'.padStart(64,'0')}})), /different round/);
  assert.throws(() => buildGameTransaction(request('rasie','sui',{room:baseRoom,amount:10000001n})), /Raise must exceed/);
});

for (const addressOnly of [false, true]) {
  test(`USDC resolves ${addressOnly ? 'address balance' : 'fragmented coin pages'} during serialization`, async () => {
    mock.method(client.core, 'getBalance', async () => ({ balance: { balance:'2000000',addressBalance:addressOnly?'2000000':'0',coinBalance:addressOnly?'0':'2000000' } }));
    const list = mock.method(client.core, 'listCoins', async ({cursor}: any) => ({ objects:addressOnly?[]:[{objectId:normalizeSuiAddress(cursor?'0x101':'0x100'),balance:'1000000',version:'1',digest:'11111111111111111111111111111111'}],hasNextPage:!addressOnly&&!cursor,cursor:!addressOnly&&!cursor?'next':null }));
    const tx=buildGameTransaction(request('rasie','usdc'));
    const resolved=Transaction.from(await tx.toJSON({client})).getData();
    assert.ok(resolved.commands.every(c=>!c.$Intent));
    assert.equal(resolved.inputs.some(input=>input.FundsWithdrawal),addressOnly);
    const split=resolved.commands.findIndex(c=>c.SplitCoins);
    assert.deepEqual(resolved.commands.find(c=>c.MoveCall?.function==='rasie')!.MoveCall!.arguments[1].NestedResult,[split,0]);
    assert.equal(list.mock.callCount(),addressOnly?1:2);
  });
  test(`SUI resolves ${addressOnly ? 'address balance' : 'gas fallback'} during serialization`, async () => {
    mock.method(client.core,'getBalance',async()=>({balance:{balance:'20000000',addressBalance:addressOnly?'20000000':'0',coinBalance:addressOnly?'0':'20000000'}}));
    mock.method(client.core,'listCoins',async()=>{throw new Error('Must not manually select SUI gas coins');});
    const tx=buildGameTransaction(request('call','sui'));
    const data=Transaction.from(await tx.toJSON({client})).getData();
    const split=data.commands.findIndex(c=>c.SplitCoins);
    assert.equal(data.commands[split].SplitCoins!.coin.$kind,addressOnly?'Result':'GasCoin');
    assert.deepEqual(data.commands.find(c=>c.MoveCall?.function==='call')!.MoveCall!.arguments[1].NestedResult,[split,0]);
  });
}
test('insufficient USDC cannot prepare a wallet transaction', async () => {
  mock.method(client.core,'getBalance',async()=>({balance:{balance:'0',addressBalance:'0',coinBalance:'0'}}));
  mock.method(client.core,'listCoins',async()=>({objects:[],hasNextPage:false,cursor:null}));
  await assert.rejects(buildGameTransaction(request('rasie','usdc')).toJSON({client}), /Insufficient balance/);
});
