import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';
import { client } from '../src/suiClient';
import { submitSigned, UncertainTransaction } from '../src/submitTransaction';

afterEach(()=>mock.restoreAll());
async function serialized() {
  const tx=new Transaction();tx.setSender('0x1');tx.setGasPrice(1000);tx.setGasBudget(1000000);
  tx.setGasPayment([{objectId:'0x2',version:'1',digest:'11111111111111111111111111111111'}]);
  return toBase64(await tx.build());
}
test('execution succeeds even if subsequent read availability times out',async()=>{
  mock.method(client,'executeTransaction',async()=>({$kind:'Transaction',Transaction:{digest:'confirmed',events:[]}}));
  mock.method(client,'waitForTransaction',async()=>{throw new Error('indexing timeout');});
  const saved:string[]=[];
  const result=await submitSigned(await serialized(),'fake-test-signature',d=>saved.push(d));
  assert.equal(result.digest,'confirmed');assert.equal(saved.length,1);assert.deepEqual(result.events,[]);
});
test('a lost submit response preserves its digest and does not retry the payment',async()=>{
  const send=mock.method(client,'executeTransaction',async()=>{throw new Error('connection lost');});
  let saved='';
  await assert.rejects(submitSigned(await serialized(),'fake-test-signature',d=>{saved=d;}),error=>error instanceof UncertainTransaction&&error.digest===saved);
  assert.ok(saved.length>20);assert.equal(send.mock.callCount(),1);
});
test('failed on-chain execution is not treated as success',async()=>{
  mock.method(client,'executeTransaction',async()=>({$kind:'FailedTransaction',FailedTransaction:{status:{success:false,error:{message:'MoveAbort'}}}}));
  const wait=mock.method(client,'waitForTransaction',async()=>{throw new Error('Must not wait');});
  await assert.rejects(submitSigned(await serialized(),'fake-test-signature'),/Transaction failed/);
  assert.equal(wait.mock.callCount(),0);
});
test('failure to persist recovery information prevents submission',async()=>{
  const send=mock.method(client,'executeTransaction',async()=>{throw new Error('Must not send');});
  await assert.rejects(submitSigned(await serialized(),'fake-test-signature',()=>{throw new Error('Storage blocked');}),/Storage blocked/);
  assert.equal(send.mock.callCount(),0);
});
