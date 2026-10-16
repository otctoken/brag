import { bls12_381 } from '@noble/curves/bls12-381';
import { toHex, normalizeSuiAddress } from '@mysten/sui/utils';
import type { TableRef, Token } from './gameConfig';

export interface RoundSecret { key: string; cards: number[] }
const prefix = 'brag:mainnet:v2';
export const signature = (secret: RoundSecret) => Array.from(bls12_381.sign(Uint8Array.from(secret.cards), secret.key));
export const publicKey = (secret: RoundSecret) => Array.from(bls12_381.getPublicKey(secret.key));
const storageKey = (address: string, token: Token, sig: number[]) => `${prefix}:cards:${normalizeSuiAddress(address)}:${token}:${toHex(Uint8Array.from(sig))}`;
const activeKey = (address: string) => `${prefix}:active:${normalizeSuiAddress(address)}`;

export function validCards(cards: unknown): cards is number[] {
  return Array.isArray(cards) && cards.length === 55 && new Set(cards.slice(0, 52)).size === 52
    && cards.slice(0, 52).every(n => Number.isInteger(n) && n >= 1 && n <= 52)
    && new Set(cards.slice(52)).size === 3 && cards.slice(52).every(n => Number.isInteger(n) && n >= 0 && n < 52);
}

function randomBelow(n: number) {
  const limit = Math.floor(0x100000000 / n) * n;
  let x: number;
  do { x = crypto.getRandomValues(new Uint32Array(1))[0]; } while (x >= limit);
  return x % n;
}

export function newSecret(): RoundSecret {
  const shuffle = (values: number[]) => {
    for (let i = values.length - 1; i > 0; i--) {
      const j = randomBelow(i + 1);
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  };
  return {
    key: toHex(bls12_381.utils.randomPrivateKey()),
    cards: [...shuffle(Array.from({ length: 52 }, (_, i) => i + 1)), ...shuffle(Array.from({ length: 52 }, (_, i) => i)).slice(0, 3).sort((a, b) => a - b)],
  };
}

// Persist BEFORE asking the wallet to sign. Rejected/uncertain transactions must
// never overwrite the secret committed by a previous successful round.
export function saveSecret(storage: Storage, address: string, token: Token, secret: RoundSecret) {
  if (!validCards(secret.cards)) throw new Error('Invalid saved deck.');
  const key = storageKey(address, token, signature(secret));
  const value = JSON.stringify(secret);
  try {
    storage.setItem(key, value);
    if (storage.getItem(key) !== value) throw new Error('Storage verification failed');
  } catch {
    throw new Error('Browser storage is unavailable. Enable local storage before funding a round so your cards can be recovered.');
  }
}

export function loadSecret(storage: Storage, address: string, token: Token, sig: number[]): RoundSecret | null {
  if (!sig.length) return null;
  try {
    const saved = JSON.parse(storage.getItem(storageKey(address, token, sig)) ?? 'null');
    if (saved && validCards(saved.cards) && signature(saved).join(',') === sig.join(',')) return saved;
    // Migrate the old singleton only when it matches this exact on-chain commitment.
    const legacy = { key: JSON.parse(storage.getItem('randomKey') ?? 'null'), cards: JSON.parse(storage.getItem('randomPoker') ?? 'null') };
    if (typeof legacy.key === 'string' && validCards(legacy.cards) && signature(legacy).join(',') === sig.join(',')) {
      saveSecret(storage, address, token, legacy);
      return legacy;
    }
  } catch { /* Malformed/blocked storage must not crash the game. */ }
  return null;
}

export function saveActive(storage: Storage, address: string, table: TableRef | null) {
  try {
    if (table) storage.setItem(activeKey(address), JSON.stringify(table));
    else storage.removeItem(activeKey(address));
  } catch { /* The per-round secret is already durable; the lobby can recover the table. */ }
}
export function loadActive(storage: Storage, address: string): TableRef | null {
  try {
    const value = JSON.parse(storage.getItem(activeKey(address)) ?? 'null');
    if (value && ['sui', 'usdc'].includes(value.token) && /^\d+$/.test(value.number) && BigInt(value.number) > 0n && BigInt(value.number) <= 18446744073709551615n) return value;
  } catch { /* Ignore a corrupt navigation pointer. */ }
  return null;
}
