import assert from 'node:assert/strict';
import { test, afterEach, mock } from 'node:test';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { bcs } from '@mysten/sui/bcs';
import { client } from '../src/suiClient';
import { PokerData } from '../src/bragChain';
import { listTables } from '../src/gameLobby';
import { MODULE, TOKENS } from '../src/gameConfig';
import { continuation, assertAction, seatOf, isWaiting, isMyTurn, callAmount, formatAmount, type Room } from '../src/gameRules';
import { newSecret, saveSecret, loadSecret, signature, saveActive, loadActive, validCards } from '../src/gameSecrets';

afterEach(()=>mock.restoreAll());
const A=normalizeSuiAddress('0x1'), B=normalizeSuiAddress('0x2'), C=normalizeSuiAddress('0x3'), Z=normalizeSuiAddress('0x0');
const room:Room={id:normalizeSuiAddress('0x9'), balance:'0',player1:A,player2:B,sigcards1:[1],sigcards2:[2],revealcards1:[],revealcards2:[],stage:11,bet:'2000000000',min_bet:'1000000000',max_bet:'10000000000',time:'0',vip_p1:false,vip_p2:false,action:false};
function storage(): Storage {
  const map=new Map<string,string>();
  return {getItem:key=>map.get(key)??null,setItem:(key,value)=>{map.set(key,value);},removeItem:key=>{map.delete(key);},clear:()=>map.clear(),key:i=>[...map.keys()][i]??null,get length(){return map.size;}};
}

test('both settlement outcomes and both continuing players support a stranger joining either seat',()=>{
  for(const stage of [11,12]) for(const continuing of [A,B]) {
    assert.equal(continuation({...room,stage},continuing),'go_on_playing');
    // Follow the seat permutation in contract::go_on_playing.
    const seat=stage===11 ? (continuing===A?2:1) : (continuing===A?1:2);
    const waiting={...room,stage:10,player1:seat===1?continuing:Z,player2:seat===2?continuing:Z};
    assert.equal(isWaiting(waiting),true);
    assert.equal(continuation(waiting,continuing),'resume');
    for(const joining of [continuing===A?B:A,C]) {
      assert.equal(continuation(waiting,joining),'join_playing');
      assert.doesNotThrow(()=>assertAction('join_playing',waiting,joining,BigInt(waiting.bet)));
    }
    const started={...waiting,stage:0,player1:seat===1?continuing:C,player2:seat===2?continuing:C};
    assert.equal(isWaiting(started),false);
    assert.equal(isMyTurn(started,started.player1),true);
    assert.equal(isMyTurn(started,started.player2),false);
  }
});

test('continuation uses current bet rather than the original minimum; repeat clicks resume',()=>{
  const waiting={...room,stage:10,player1:Z,player2:A};
  assert.notEqual(waiting.bet,waiting.min_bet);
  assert.throws(()=>assertAction('join_playing',waiting,B,BigInt(waiting.min_bet)),/ante changed/);
  assert.doesNotThrow(()=>assertAction('join_playing',waiting,B,BigInt(waiting.bet)));
  assert.equal(continuation(waiting,A),'resume');
  assert.equal(continuation({...waiting,player1:B,stage:0},B),'resume');
  assert.throws(()=>continuation({...waiting,player1:B,stage:0},C),/no longer available/);
});

test('timeout uses the configured deadline, last actor and strict greater-than comparison',()=>{
  const active={...room,stage:0,time:'100000',action:true};
  assert.throws(()=>assertAction('get_timeout_bets',active,A,undefined,130000,30000),/not passed/);
  assert.doesNotThrow(()=>assertAction('get_timeout_bets',active,A,undefined,130001,30000));
  assert.throws(()=>assertAction('get_timeout_bets',active,B,undefined,130001,30000),/other player/);
  assert.throws(()=>assertAction('get_timeout_bets',{...active,stage:10},A,undefined,130001,30000),/not passed/);
});

test('active games cannot close; amount display and blind calls preserve small and large units',()=>{
  assert.throws(()=>assertAction('leave_game',{...room,stage:0},A),/must be settled/);
  assert.equal(formatAmount(10001n,1e9),'0.000010001');
  assert.equal(formatAmount('9007199254740993',1e9),'9007199.254740993');
  assert.equal(callAmount({...room,bet:'9007199254740993'},A),4503599627370496n);
});

test('round secrets survive cancellation and remain isolated across wallets, tokens and commitments',()=>{
  const s=storage(), first=newSecret(), cancelled=newSecret();
  saveSecret(s,A,'sui',first); saveSecret(s,A,'sui',cancelled);
  assert.deepEqual(loadSecret(s,A,'sui',signature(first)),first);
  assert.equal(loadSecret(s,B,'sui',signature(first)),null);
  assert.equal(loadSecret(s,A,'usdc',signature(first)),null);
  assert.deepEqual(loadSecret(s,A,'sui',signature(cancelled)),cancelled);
  assert.equal(validCards(first.cards),true);
  assert.equal(new Set(first.cards.slice(0,52)).size,52);
});

test('malformed or unavailable storage does not crash reads and blocks funding',()=>{
  const s=storage(), secret=newSecret();
  s.setItem('randomKey','{broken');
  assert.equal(loadSecret(s,A,'sui',signature(secret)),null);
  mock.method(s,'setItem',()=>{throw new Error('Quota exceeded');});
  assert.throws(()=>saveSecret(s,A,'sui',secret),/storage is unavailable/);
  assert.equal(loadActive(s,A),null);
});

test('legacy singleton is migrated only after validating its chain commitment',()=>{
  const s=storage(), old=newSecret(), other=newSecret();
  s.setItem('randomKey',JSON.stringify(old.key));s.setItem('randomPoker',JSON.stringify(old.cards));
  assert.equal(loadSecret(s,A,'sui',signature(other)),null);
  assert.deepEqual(loadSecret(s,A,'sui',signature(old)),old);
  s.removeItem('randomKey');s.removeItem('randomPoker');
  assert.deepEqual(loadSecret(s,A,'sui',signature(old)),old);
  saveActive(s,A,{token:'usdc',number:'9007199254740993'});
  assert.deepEqual(loadActive(s,A),{token:'usdc',number:'9007199254740993'});
  assert.equal(loadActive(s,B),null);
  saveActive(s,A,null);assert.equal(loadActive(s,A),null);
});

test('lobby discovers current objects across pages, including continued tables with either empty seat',async()=>{
  const waits=[{...room,stage:10,player1:Z,balance:room.bet},{...room,stage:10,player2:Z,balance:room.bet}];
  mock.method(client,'listEvents',()=>{throw new Error('Old Close events must not hide a reopened room');});
  mock.method(client,'listDynamicFields',async({cursor}:any)=>({
    dynamicFields:[{ $kind:'DynamicObject',childId:cursor?'second':'first',valueType:`${MODULE}::PokerData<${TOKENS.sui.type}>`,name:{type:'0x2::dynamic_object_field::Wrapper<u64>',bcs:bcs.u64().serialize(cursor?'9007199254740993':'42').toBytes()} }],
    hasNextPage:!cursor,cursor:cursor?null:'page2',
  }));
  mock.method(client,'getObjects',async({objectIds}:any)=>({objects:[{content:PokerData.serialize(waits[objectIds[0]==='first'?0:1]).toBytes()}]}));
  const result=await listTables('sui');
  assert.deepEqual(result.map(t=>t.number),['9007199254740993','42']);
  assert.ok(result.every(t=>isWaiting(t.room)));
});

test('lobby propagates network failures and broken cursors rather than reporting no rooms',async()=>{
  mock.method(client,'listDynamicFields',async()=>({dynamicFields:[],hasNextPage:true,cursor:'same'}));
  await assert.rejects(listTables('sui'),/cursor did not advance/);
  mock.restoreAll();
  mock.method(client,'listDynamicFields',async()=>{throw new Error('network unavailable');});
  await assert.rejects(listTables('usdc'),/network unavailable/);
});
