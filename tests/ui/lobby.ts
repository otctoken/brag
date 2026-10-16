import { state } from './state';
export { isMissingRoom } from '../../src/gameLobby';
export async function listTables(token:string){if(state.networkError)throw new Error('Network unavailable');return token===state.token&&state.room?[{token,number:'42',room:structuredClone(state.room)}]:[];}
export async function getTiming(){return {countdown:60000,chainTime:Date.now(),sampledAt:performance.now()};}
