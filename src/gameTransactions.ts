import { Transaction } from '@mysten/sui/transactions';
import { MODULE, NFT_TYPE, TOKENS, DEFAULT_KIOSK, DEFAULT_NFT, type Token } from './gameConfig';
import { assertAction, signatureOf, type GameAction, type Room } from './gameRules';
import { signature, publicKey, validCards, type RoundSecret } from './gameSecrets';

export interface ActionRequest {
  action: GameAction; token: Token; address: string; number?: string;
  room?: Room; amount?: bigint; maxBet?: bigint; secret?: RoundSecret;
  kiosk?: string; nft?: string; now?: number; countdown?: number;
}

export function buildGameTransaction(request: ActionRequest) {
  const { action, token, address, amount, room, secret } = request;
  const config = TOKENS[token];
  if (action === 'create_game') {
    if (amount === undefined || amount < 10000n || amount > 1000000000000000n || !request.maxBet || request.maxBet < amount || request.maxBet > 1000000000000000n) throw new Error('Choose a positive ante and maximum bet within the table limits.');
  } else {
    if (!room || !request.number) throw new Error('Refresh the table before taking an action.');
    assertAction(action, room, address, amount, request.now, request.countdown);
  }
  const needsSecret = ['create_game', 'join_playing', 'go_on_playing', 'reveal_look_cards', 'applyOpenCards', 'OpenCards', 'get_fold_bets'].includes(action);
  if (needsSecret && (!secret || !validCards(secret.cards))) throw new Error('The cards for this round are missing from this browser. Return to the device where you started it.');
  if (needsSecret && room && !['join_playing', 'go_on_playing'].includes(action)
    && signature(secret!).join(',') !== signatureOf(room, address).join(',')) throw new Error('These saved cards belong to a different round. Refresh the table.');
  const tx = new Transaction();
  tx.setSender(address);
  const data = tx.object(config.game);
  const number = () => tx.pure.u64(request.number!);
  const clock = () => tx.object('0x6');
  const coin = () => tx.coin({ balance: amount!, type: config.type });
  const sig = () => tx.pure.vector('u8', signature(secret!));
  const cards = () => tx.pure.vector('u8', secret!.cards);
  const pk = () => tx.pure.vector('u8', publicKey(secret!));
  const kiosk = () => tx.object(request.kiosk ?? DEFAULT_KIOSK);
  const nft = () => tx.pure.id(request.nft ?? DEFAULT_NFT);
  let args;
  switch (action) {
    case 'create_game': args = [sig(), tx.pure.u64(request.maxBet!), coin(), data, kiosk(), nft()]; break;
    // join_playing handles BOTH empty seats, including a freshly created table.
    case 'join_playing': args = [number(), sig(), coin(), clock(), data, kiosk(), nft()]; break;
    case 'go_on_playing': args = [number(), sig(), coin(), data]; break;
    case 'call': case 'rasie': args = [number(), coin(), clock(), data]; break;
    case 'applyOpenCards': args = [number(), cards(), pk(), coin(), clock(), data]; break;
    case 'OpenCards': case 'get_fold_bets': args = [number(), cards(), pk(), data]; break;
    case 'reveal_look_cards': args = [number(), tx.pure.vector('u8', secret!.cards.slice(52)), clock(), data]; break;
    case 'leave_game': args = [number(), data]; break;
    default: args = [number(), clock(), data];
  }
  tx.moveCall({ target: `${MODULE}::${action}`, typeArguments: [config.type, NFT_TYPE], arguments: args });
  return tx;
}
