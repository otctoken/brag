import { normalizeSuiAddress } from '@mysten/sui/utils';
import type { getRoom } from './bragChain';

export type Room = Awaited<ReturnType<typeof getRoom>>;
export type GameAction = 'create_game' | 'join_playing' | 'go_on_playing' | 'apply_look_cards' | 'reveal_look_cards' | 'call' | 'rasie' | 'applyOpenCards' | 'OpenCards' | 'fold' | 'get_fold_bets' | 'get_timeout_bets' | 'leave_game';
export const isZero = (address: string) => /^0x0+$/.test(address);
export const sameAddress = (a?: string, b?: string) => Boolean(a && b && normalizeSuiAddress(a) === normalizeSuiAddress(b));
export const seatOf = (room: Room, address?: string) => sameAddress(room.player1, address) ? 1 : sameAddress(room.player2, address) ? 2 : 0;
export const isWaiting = (room: Room) => room.stage === 10 && isZero(room.player1) !== isZero(room.player2);
export const isSettled = (room: Room) => room.stage === 11 || room.stage === 12;
export const signatureOf = (room: Room, address: string) => seatOf(room, address) === 1 ? room.sigcards1 : room.sigcards2;
export const opponentReveal = (room: Room, address: string) => seatOf(room, address) === 1 ? room.revealcards2 : room.revealcards1;
export const hasSeen = (room: Room, address: string) => opponentReveal(room, address).length > 0;
export const isMyTurn = (room: Room, address: string) => Boolean(seatOf(room, address)) && room.stage < 10 && room.action !== (seatOf(room, address) === 1);
export const callAmount = (room: Room, address: string) => hasSeen(room, address) ? BigInt(room.bet) : BigInt(room.bet) / 2n;
export const showdownAmount = (room: Room, address: string) => BigInt(room.bet) * (hasSeen(room, address) ? 2n : 1n);
export const maxRaise = (room: Room, address: string) => BigInt(room.max_bet) * (hasSeen(room, address) ? 2n : 1n);

export function formatAmount(amount: string | bigint, scale: number) {
  const n = BigInt(amount), unit = BigInt(scale);
  const fraction = String(n % unit).padStart(Math.log10(scale), '0').replace(/0+$/, '');
  return `${n / unit}${fraction ? `.${fraction}` : ''}`;
}

// Continue always uses fresh state: either open another round, fill its empty
// seat, or resume a round already started by another transaction/tab.
export function continuation(room: Room, address: string): 'go_on_playing' | 'join_playing' | 'resume' {
  if (isWaiting(room)) return seatOf(room, address) ? 'resume' : 'join_playing';
  if (isSettled(room) && seatOf(room, address)) return 'go_on_playing';
  if (room.stage < 10 && seatOf(room, address)) return 'resume';
  throw new Error('This table is no longer available to join. Refresh the lobby.');
}

export function assertAction(action: GameAction, room: Room, address: string, amount?: bigint, now?: number, countdown?: number) {
  if (action === 'join_playing') {
    if (!isWaiting(room)) throw new Error('This table is full or closed. Refresh the lobby.');
    if (seatOf(room, address)) throw new Error('You are already seated. Resume this table instead.');
    if (amount !== BigInt(room.bet)) throw new Error('The ante changed. Refresh the table before joining.');
    return;
  }
  if (!seatOf(room, address)) throw new Error('Your wallet is not seated at this table.');
  if (action === 'go_on_playing') {
    if (!isSettled(room)) throw new Error('The next round has already started. Refresh and join it.');
    if (amount === undefined || amount < BigInt(room.min_bet) || amount > BigInt(room.max_bet)) throw new Error('Next-round ante must be within the table minimum and maximum.');
    return;
  }
  if (action === 'leave_game') {
    if (room.stage !== 10 && !isSettled(room)) throw new Error('An active round must be settled before closing the table.');
    return;
  }
  if (action === 'get_timeout_bets') {
    if (room.stage >= 10 || !Number(room.time) || !now || !countdown || now <= Number(room.time) + countdown) throw new Error('The on-chain turn deadline has not passed yet.');
    if (room.action !== (seatOf(room, address) === 1)) throw new Error('The timeout payout belongs to the other player.');
    return;
  }
  if (!isMyTurn(room, address)) throw new Error('It is not your turn. The table has been refreshed.');
  const required = { reveal_look_cards: 6, OpenCards: 4, get_fold_bets: 5 }[action];
  if (required !== undefined && room.stage !== required) throw new Error('The table stage changed. Please use the updated actions.');
  if (['call', 'rasie', 'apply_look_cards', 'applyOpenCards'].includes(action) && room.stage >= 4) throw new Error('Finish the current reveal or settlement first.');
  if (action === 'fold' && room.stage >= 5) throw new Error('You cannot fold at this stage.');
  if (action === 'apply_look_cards' && hasSeen(room, address)) throw new Error('Your cards have already been revealed.');
  if (action === 'call' && amount !== callAmount(room, address)) throw new Error('The call amount changed. Review the updated table.');
  if (action === 'applyOpenCards' && amount !== showdownAmount(room, address)) throw new Error('The showdown amount changed. Review the updated table.');
  if (action === 'rasie' && (amount === undefined || amount <= callAmount(room, address) || amount > maxRaise(room, address))) throw new Error('Raise must exceed the call and stay within the table limit.');
}

export function gameError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/reject|cancel|denied by user/i.test(message)) return 'Wallet request cancelled. Your table and cards are unchanged.';
  if (/insufficient|gas balance/i.test(message)) return 'Insufficient balance. Keep some SUI for gas, including when playing with USDC.';
  if (/MoveAbort|abort.*code|object.*version|stale/i.test(message)) return 'The table changed before the transaction completed. Refresh, check the current turn and try again.';
  if (/fetch|network|unavailable|timeout/i.test(message)) return 'Network unavailable. Your saved cards are safe; refresh before trying another transaction.';
  return message;
}
