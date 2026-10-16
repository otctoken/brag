import { state } from './state';
export function useCurrentAccount(){return state.address?{address:state.address,chains:['sui:mainnet']}:null;}
