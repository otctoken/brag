import { bcs } from '@mysten/sui/bcs';
import { fromBase64 } from '@mysten/sui/utils';
import type { Transaction } from '@mysten/sui/transactions';
import { state, A, Z } from './state';
export function useExecuteTransaction(){return async({transaction}:{transaction:Transaction})=>{
  state.attempts++;
  if(state.walletJump){window.scrollTo(0,0);window.dispatchEvent(new Event('focus'));}
  await new Promise(resolve=>setTimeout(resolve,state.walletDelay));
  if(state.failNext){state.failNext=false;throw new Error('User rejected request');}
  const data=transaction.getData(), call=data.commands.find(c=>c.MoveCall)?.MoveCall!;
  const action=call.function;
  const amount=String(data.commands.find(c=>c.$Intent)?.$Intent?.data.balance??0);
  state.executions.push({action,amount,argumentCount:call.arguments.length});
  const cardsArg=call.arguments[action==='create_game'?0:1];
  const sig=['go_on_playing','join_playing'].includes(action)?bcs.vector(bcs.u8()).parse(fromBase64(data.inputs[cardsArg.Input!].Pure!.bytes)):[];
  if(action==='go_on_playing') {
    const r=state.room!;
    const second=(r.stage===11&&r.player1===A)||(r.stage===12&&r.player2===A);
    state.room={...r,stage:10,player1:second?Z:A,player2:second?A:Z,sigcards1:second?[]:sig,sigcards2:second?sig:[],revealcards1:[],revealcards2:[],bet:amount,balance:amount,action:false,time:'0'};
  }
  if(action==='join_playing'){
    const r=state.room!,first=r.player1===Z;
    state.room={...r,stage:0,player1:first?A:r.player1,player2:first?r.player2:A,sigcards1:first?sig:r.sigcards1,sigcards2:first?r.sigcards2:sig,balance:String(BigInt(r.balance)+BigInt(amount)),time:String(Date.now()),action:false};
  }
  if(action==='call')state.room={...state.room!,action:!state.room!.action,time:String(Date.now())};
  if(action==='leave_game')state.room=null;
  return {digest:'offline-test-confirmation',events:[]};
};}
