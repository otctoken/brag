import { normalizeSuiAddress } from '@mysten/sui/utils';
import { type Room } from '../../src/gameRules';
import { newSecret, saveSecret, signature } from '../../src/gameSecrets';
export const A=normalizeSuiAddress('0x1'), B=normalizeSuiAddress('0x2'), Z=normalizeSuiAddress('0x0');
const scenario=new URLSearchParams(location.search).get('scenario')??'settled';
const deck=newSecret();
const base:Room={id:normalizeSuiAddress('0x9'),balance:'0',player1:A,player2:B,sigcards1:signature(deck),sigcards2:[2],revealcards1:[],revealcards2:[],stage:11,bet:'1000000000',min_bet:'1000000000',max_bet:'10000000000',time:'0',vip_p1:false,vip_p2:false,action:false};
if(scenario==='waiting-other'){base.stage=10;base.player1=Z;base.player2=B;base.balance='3000000000';base.bet='3000000000';base.sigcards1=[];}
if(scenario==='active'){base.stage=0;base.time=String(Date.now());base.balance='2000000000';}
if(scenario==='lobby'){base.stage=10;base.player1=B;base.player2=Z;base.balance=base.bet;}
if(scenario==='cancel'){}
try {saveSecret(localStorage,A,'sui',deck);}catch{}
export const state={address:scenario==='guest'?undefined:A,room:base as Room|null,scenario,attempts:0,executions:[] as {action:string;amount:string;argumentCount:number}[],failNext:scenario==='cancel',networkError:false,walletJump:false,walletDelay:100};
