import { state } from './state';
export async function getRoom(){if(state.networkError)throw new Error('Network unavailable');if(!state.room)throw new Error('Object not found');return structuredClone(state.room);}
export async function findKioskNFT(){return false;}
export async function findOpenCards(){return null;}
export { decodeBragEvent } from '../../src/bragChain';
