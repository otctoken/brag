import { queryBragEvents, type BragHistoryEvent } from './bragChain';

const volumeEvent = '0x93a36744eff6ee002ef32948866098eae032f277e7e702133dd35dc7cbfe1681::brag::Gvol';
const tokens = [
  { type: 'sui', coin: '0x2::sui::SUI', decimals: 9 },
  { type: 'usdc', coin: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC', decimals: 6 },
] as const;

export interface Bet {
  id: string;
  time: number;
  player: string;
  game: string;
  wager: string;
  multiplier: string;
  profit: string;
  link: string;
  type: 'sui' | 'usdc';
}

export function toBet(event: BragHistoryEvent, type: Bet['type'], decimals: number): Bet {
  const { player, vol, expendORincome } = event.parsedJson;
  if (typeof player !== 'string' || typeof vol !== 'string' || typeof expendORincome !== 'boolean') {
    throw new Error('Invalid bet event');
  }
  // Preserve integer precision and the existing two-decimal, truncate-down display.
  const cents = BigInt(vol) / (10n ** BigInt(decimals - 2));
  const amount = `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`;
  return {
    id: `${event.id.txDigest}:${event.id.eventSeq}`,
    time: Number(event.timestampMs), player, game: 'Brag',
    wager: expendORincome ? '--' : amount,
    profit: expendORincome ? amount : '--',
    multiplier: '--', // Gvol contains no multiplier; do not invent one.
    link: event.id.txDigest, type,
  };
}

export function recentBets(bets: Bet[], limit = 120): Bet[] {
  return [...new Map(bets.map(bet => [bet.id, bet])).values()]
    .sort((a, b) => b.time - a.time || b.id.localeCompare(a.id))
    .slice(0, limit);
}

export async function loadBetHistory(signal?: AbortSignal): Promise<Bet[]> {
  const lists = await Promise.all(tokens.map(async token => {
    const { data } = await queryBragEvents(`${volumeEvent}<${token.coin}>`, 120, signal);
    return data.map(event => toBet(event, token.type, token.decimals));
  }));
  return recentBets(lists.flat());
}
