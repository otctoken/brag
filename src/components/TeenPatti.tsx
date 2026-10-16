import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useExecuteTransaction } from '../useExecuteTransaction';
import { findKioskNFT, getRoom, decodeBragEvent, findOpenCards } from '../bragChain';
import { client } from '../suiClient';
import { UncertainTransaction } from '../submitTransaction';
import { getTiming, isMissingRoom, listTables, type LobbyTable } from '../gameLobby';
import { TOKENS, MODULE, PACKAGE, NFT_TYPE, type TableRef, type Token } from '../gameConfig';
import { buildGameTransaction } from '../gameTransactions';
import { newSecret, saveSecret, loadSecret, saveActive, loadActive, type RoundSecret } from '../gameSecrets';
import { assertAction, defaultNextAnte, callAmount, continuation, formatAmount, gameError, hasSeen, isMyTurn, isSettled, isWaiting, isZero, maxRaise, opponentReveal, seatOf, showdownAmount, signatureOf, type GameAction, type Room } from '../gameRules';
import { toBaseUnits, twoDecimalInput, nextTwoDecimalAmount } from '../coinAmount';
import { preserveWalletViewport } from '../walletViewport';
import '../game.css';

const cardImages = import.meta.glob('../assets/pokerpng/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const short = (address: string) => isZero(address) ? 'Open seat' : `${address.slice(0, 6)}…${address.slice(-4)}`;
const roomKey = (table: TableRef) => ['brag-room', table.token, table.number];
const roundId = (room: Room) => `${room.sigcards1.join(',')}:${room.sigcards2.join(',')}`;
const newRoundActions = ['create_game', 'join_playing', 'go_on_playing'];
interface PendingSubmission { digest: string; table: TableRef; action: GameAction; expiresEpoch: number }

function Cards({ values, label }: { values: number[]; label: string }) {
  return <div className="brag-cards" aria-label={label}>
    {[0, 1, 2].map(index => {
      const value = values[index];
      const suit = ['H', 'S', 'C', 'D'][(value - 1) % 4];
      const rank = Math.floor((value - 1) / 4) + 1;
      const name = value >= 1 && value <= 52 ? `${rank}${suit}` : '0';
      return <img key={index} src={cardImages[`../assets/pokerpng/${name}.png`]} alt={name === '0' ? 'Face-down card' : `${['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'][rank]} of ${{ H: 'hearts', S: 'spades', C: 'clubs', D: 'diamonds' }[suit]}`} />;
    })}
  </div>;
}

export default function TeenPatti({ onGetbalan }: { onGetbalan: () => void }) {
  const account = useCurrentAccount();
  const address = account?.address;
  const pendingKey = `brag:pending:mainnet:${address}`;
  const [unconfirmed, setUnconfirmed] = useState<PendingSubmission | null>(() => {
    try { const value = JSON.parse(localStorage.getItem(pendingKey) ?? 'null'); return value?.digest && value?.table ? value : null; } catch { return null; }
  });
  const queryClient = useQueryClient();
  const executeTransaction = useExecuteTransaction();
  const [active, setActive] = useState<TableRef | null>(() => {
    try { return address ? loadActive(localStorage, address) : null; } catch { return null; }
  });
  const [token, setToken] = useState<Token>('sui');
  const [filter, setFilter] = useState<'all' | Token>('all');
  const [ante, setAnte] = useState('1');
  const [maximum, setMaximum] = useState('10');
  const [nextAnte, setNextAnte] = useState('');
  const [raise, setRaise] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [digest, setDigest] = useState('');
  const [tick, setTick] = useState(0);
  const [storageVersion, setStorageVersion] = useState(0);
  const locked = useRef(false);
  const viewport = useRef<ReturnType<typeof preserveWalletViewport> | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; viewport.current?.cancel(); }; }, []);

  const suiLobby = useQuery({ queryKey: ['brag-lobby', 'sui'], queryFn: ({ signal }) => listTables('sui', signal), refetchInterval: 12000, retry: 1 });
  const usdcLobby = useQuery({ queryKey: ['brag-lobby', 'usdc'], queryFn: ({ signal }) => listTables('usdc', signal), refetchInterval: 12000, retry: 1 });
  const roomQuery = useQuery({
    queryKey: active ? roomKey(active) : ['brag-room', 'none'],
    queryFn: ({ signal }) => getRoom(TOKENS[active!.token].game, active!.number, signal),
    enabled: Boolean(active), refetchInterval: 3000, retry: 1,
  });
  const timing = useQuery({ queryKey: ['brag-timing', active?.token ?? token], queryFn: () => getTiming(active?.token ?? token), enabled: Boolean(active), refetchInterval: 15000, retry: 1 });
  const vip = useQuery({ queryKey: ['brag-vip', address], queryFn: () => findKioskNFT(address!, NFT_TYPE), enabled: Boolean(address), staleTime: 60000, retry: 1 });
  const room = active ? roomQuery.data : undefined;
  const config = TOKENS[active?.token ?? token];
  const tables = [...(suiLobby.data ?? []), ...(usdcLobby.data ?? [])];
  const myTables = address ? tables.filter(table => seatOf(table.room, address)) : [];
  const openTables = tables.filter(table => isWaiting(table.room) && !seatOf(table.room, address) && (filter === 'all' || filter === table.token));
  const seat = room ? seatOf(room, address) : 0;
  const waiting = room && isWaiting(room);
  const settled = room && isSettled(room);
  const ownTurn = Boolean(room && address && isMyTurn(room, address));
  const readOnly = !address || Boolean(pending) || Boolean(unconfirmed) || roomQuery.isError;
  const secret = useMemo(() => {
    try { return room && address && seat && active ? loadSecret(localStorage, address, active.token, signatureOf(room, address)) : null; } catch { return null; }
  }, [address, active?.token, room && address ? signatureOf(room, address).join(',') : '', seat, storageVersion]);
  const chainNow = timing.data ? timing.data.chainTime + performance.now() - timing.data.sampledAt : 0;
  const seconds = room && timing.data && room.stage < 10 ? Math.max(0, Math.ceil((Number(room.time) + timing.data.countdown - chainNow) / 1000)) : 0;
  const timeoutReady = Boolean(room && seat && room.stage < 10 && Number(room.time) > 0 && timing.data && !timing.isError
    && chainNow > Number(room.time) + timing.data.countdown && room.action === (seat === 1));
  const onchainReveal = room && address && seat ? opponentReveal(room, address) : [];
  const otherSignature = room ? seat === 1 ? room.sigcards2 : room.sigcards1 : [];
  const ownReveal = room ? seat === 1 ? room.revealcards1 : room.revealcards2 : [];
  const resultCards = useQuery({
    queryKey: ['brag-reveal', active?.token, active?.number, otherSignature.join(',')],
    queryFn: async () => await findOpenCards(PACKAGE, active!.number, { sender: seat === 1 ? room!.player2 : room!.player1, signature: otherSignature }) ?? null,
    enabled: Boolean(active && settled && seat && ownReveal.length === 55 && onchainReveal.length !== 55),
    refetchInterval: query => query.state.data ? false : 10000, retry: 1,
  });
  const otherReveal = onchainReveal.length === 55 ? onchainReveal : resultCards.data?.[0] ?? onchainReveal;
  const indices = otherReveal.length === 55 ? otherReveal.slice(52) : otherReveal;
  const myCards = secret && indices.length === 3 ? indices.map(i => secret!.cards[i]) : [];
  const otherCards = secret && otherReveal.length === 55 ? secret.cards.slice(52).map(i => otherReveal[i]) : [];
  const opponent = room ? seat === 2 ? room.player1 : room.player2 : '0x0';
  const actingSeat = room?.action ? 2 : 1;
  const turnOwner = seat ? ownTurn ? 'Your' : 'Opponent' : `Player ${actingSeat}`;
  const clockSynced = Boolean(timing.data && !timing.isError);
  const urgent = ownTurn && clockSynced && seconds <= 10;
  const turnHint = room?.stage === 6 ? 'Reveal cards for the other player' : room?.stage === 4 ? 'Reveal cards and settle' : room?.stage === 5 ? 'Claim fold winnings' : 'Choose your next move';
  const winner = room && settled ? room.stage === 11 ? room.player1 : room.player2 : '';

  useEffect(() => {
    const id = room && room.stage < 10 ? window.setInterval(() => setTick(value => value + 1), 1000) : undefined;
    const sync = () => setStorageVersion(value => value + 1);
    window.addEventListener('storage', sync);
    return () => { clearInterval(id); window.removeEventListener('storage', sync); };
  }, [room?.stage]);
  // Re-render countdown from the chain clock, including after a backgrounded tab wakes.
  void tick; void storageVersion;
  useEffect(() => {
    if (room && settled) setNextAnte(defaultNextAnte(room, config.scale));
  }, [active?.token, active?.number, room?.stage, room?.min_bet, room?.max_bet]);
  useEffect(() => { setRaise(''); }, [active?.token, active?.number, room?.stage, room?.bet]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (pending || (room && seat && room.stage < 10)) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [pending, room?.stage, seat]);

  function selectTable(table: TableRef | null) {
    if (table?.number !== active?.number || table?.token !== active?.token) viewport.current?.cancel();
    setActive(table); setError(''); setNotice('');
    try { if (address) saveActive(localStorage, address, table); } catch { /* Room discovery remains available. */ }
  }
  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ['brag-lobby'] });
    void queryClient.invalidateQueries({ queryKey: ['brag-room'] });
    void queryClient.invalidateQueries({ queryKey: ['brag-timing'] });
  }
  async function run(label: string, work: () => Promise<void>, recovering = false) {
    if (locked.current) return;
    if (!address) { setError('Connect your wallet to play.'); return; }
    if (!recovering && unconfirmed) { setError('Check the previous transaction before sending another one.'); return; }
    viewport.current?.cancel();
    viewport.current = active ? preserveWalletViewport() : null;
    locked.current = true; setPending(label); setError(''); setNotice('');
    const perform = async () => {
      try {
        if (!recovering) {
          // Check inside the cross-tab lock; another tab may have submitted
          // since this component last rendered its pending state.
          const saved = localStorage.getItem(pendingKey);
          if (saved) { setUnconfirmed(JSON.parse(saved)); throw new Error('Check the previous signed transaction before sending another one.'); }
        }
        await work();
      }
      catch (cause) { if (mounted.current) setError(cause instanceof UncertainTransaction ? cause.message : gameError(cause)); }
      finally {
        if (mounted.current) { setPending(''); setStorageVersion(value => value + 1); refresh(); }
        locked.current = false;
        viewport.current?.finish();
      }
    };
    // Coordinate wallet actions across tabs as well as rapid clicks in this tab.
    if (navigator.locks) {
      try {
        await navigator.locks.request(`brag:wallet:${address}`, { ifAvailable: true }, async lock => {
          if (lock) await perform();
          else { viewport.current?.cancel(); locked.current = false; setPending(''); setError('Another tab is sending a game transaction. Wait for it to finish.'); }
        });
      } catch (cause) {
        viewport.current?.cancel();
        locked.current = false;
        if (mounted.current) { setPending(''); setError(gameError(cause)); }
      }
    } else await perform();
  }
  async function fresh(table: TableRef) {
    const data = await getRoom(TOKENS[table.token].game, table.number);
    await queryClient.cancelQueries({ queryKey: roomKey(table) });
    queryClient.setQueryData(roomKey(table), data);
    return data;
  }
  async function submit(action: GameAction, table: TableRef, data?: Room, amount?: bigint, maxBet?: bigint) {
    let cards: RoundSecret | undefined;
    if (newRoundActions.includes(action)) {
      // Validate before generating anything or opening the wallet.
      if (data) assertAction(action, data, address!, amount);
      cards = newSecret();
      saveSecret(localStorage, address!, table.token, cards);
    } else if (data) {
      cards = loadSecret(localStorage, address!, table.token, signatureOf(data, address!)) ?? undefined;
    }
    const clock = action === 'get_timeout_bets' ? await getTiming(table.token) : timing.data;
    const transaction = buildGameTransaction({ action, token: table.token, number: table.number, room: data, amount, maxBet, address: address!, secret: cards,
      kiosk: vip.data ? vip.data[0] : undefined, nft: vip.data ? vip.data[1] : undefined,
      now: clock?.chainTime, countdown: clock?.countdown });
    let response: Awaited<ReturnType<typeof executeTransaction>>;
    try {
      response = await executeTransaction({ transaction, onSigned: signedDigest => {
        const record: PendingSubmission = { digest: signedDigest, table, action,
          expiresEpoch: Number(transaction.getData().expiration?.ValidDuring?.maxEpoch) };
        // A failed write aborts before submission; never lose the recovery digest.
        localStorage.setItem(pendingKey, JSON.stringify(record));
        if (mounted.current) setUnconfirmed(record);
      } });
      localStorage.removeItem(pendingKey);
      if (mounted.current) setUnconfirmed(null);
    } catch (cause) {
      if (!(cause instanceof UncertainTransaction)) {
        localStorage.removeItem(pendingKey);
        if (mounted.current) setUnconfirmed(null);
      }
      throw cause;
    }
    if (!mounted.current) return;
    setDigest(response.digest);
    if (action === 'create_game') {
      const opened = response.events.find(event => event.eventType.startsWith(`${MODULE}::GnumberOpen<`));
      if (!opened?.parsedJson?.result) {
        setNotice('Transaction confirmed. Use My tables below to recover the new table.');
        return;
      }
      table = { ...table, number: String(opened.parsedJson.result) };
    }
    if (action === 'leave_game' || action === 'get_timeout_bets') {
      selectTable(null);
      setNotice(action === 'leave_game' ? 'Table closed. Any waiting stake was returned to its owner.' : 'Timeout payout confirmed. The table is now closed.');
    } else {
      selectTable(table);
      try { await fresh(table); }
      catch { setNotice('Transaction confirmed. Waiting for the table to refresh…'); }
      if (action === 'go_on_playing') setNotice('The next round is open to everyone in the lobby. The first player to join gets the empty seat.');
    }
    void queryClient.invalidateQueries({ queryKey: ['brag', 'mainnet', 'bet-history'] });
    onGetbalan();
  }
  function createTable(event: React.FormEvent) {
    event.preventDefault();
    void run('Creating table…', async () => {
      const amount = toBaseUnits(ante, TOKENS[token].scale), maxBet = toBaseUnits(maximum, TOKENS[token].scale);
      await submit('create_game', { token, number: '0' }, undefined, amount, maxBet);
    });
  }
  function join(table: TableRef & { room?: Room }) {
    void run('Checking table…', async () => {
      const data = await fresh(table);
      if (seatOf(data, address!)) { selectTable(table); return; }
      if (table.room && data.bet !== table.room.bet) throw new Error('This table now has a different ante. Review the refreshed lobby before joining.');
      await submit('join_playing', table, data, BigInt(data.bet));
    });
  }
  function continueRound() {
    if (!active) return;
    void run('Checking table before opening wallet…', async () => {
      const data = await fresh(active);
      const action = continuation(data, address!);
      if (action === 'resume') { setNotice('This round is already open. Your seat has been restored.'); return; }
      const amount = action === 'join_playing' ? BigInt(data.bet) : toBaseUnits(nextAnte, TOKENS[active.token].scale);
      if (action === 'go_on_playing' && (amount < BigInt(data.min_bet) || amount > BigInt(data.max_bet))) throw new Error(`Wallet not opened: this table requires ${formatAmount(data.min_bet, config.scale)}–${formatAmount(data.max_bet, config.scale)} ${config.symbol}. Adjust the next-round ante and try again.`);
      setPending('Waiting for wallet / confirmation…');
      await submit(action, active, data, amount);
    });
  }
  function act(action: GameAction) {
    if (!active || !room) return;
    const displayed = room;
    void run('Waiting for wallet / confirmation…', async () => {
      const data = await fresh(active);
      if (roundId(data) !== roundId(displayed)) throw new Error('A new round has started. Review the refreshed table before acting.');
      const amount = action === 'call' ? callAmount(displayed, address!) : action === 'applyOpenCards' ? showdownAmount(displayed, address!) : action === 'rasie' ? toBaseUnits(raise, config.scale) : undefined;
      await submit(action, active, data, amount);
    });
  }
  function openByNumber(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d+$/.test(roomInput) || BigInt(roomInput) <= 0n || BigInt(roomInput) > 18446744073709551615n) { setError('Enter a valid positive table number.'); return; }
    selectTable({ token, number: BigInt(roomInput).toString() });
  }
  function checkSubmission() {
    if (!unconfirmed) return;
    void run('Checking submitted transaction…', async () => {
      let result;
      try { result = await client.getTransaction({ digest: unconfirmed.digest, include: { events: true, effects: true } }); }
      catch (cause) {
        // A lost submission may never have reached a node. After its signed
        // validity epoch expires it cannot be newly executed by retrying it.
        if (!isMissingRoom(cause)) throw cause;
        const { systemState } = await client.getCurrentSystemState();
        if (!Number.isFinite(unconfirmed.expiresEpoch) || Number(systemState.epoch) <= unconfirmed.expiresEpoch) throw new Error('Confirmation is still unavailable. Do not resend. Check again shortly; the transaction link is available below.');
        localStorage.removeItem(pendingKey); setUnconfirmed(null);
        setNotice('The signed transaction has expired and was not found. Refresh My tables to check for any completed round before starting again.');
        return;
      }
      localStorage.removeItem(pendingKey); setUnconfirmed(null);
      if (result.$kind === 'FailedTransaction') throw new Error('The transaction failed on chain. Your saved cards are unchanged. Refresh and try again.');
      setDigest(result.Transaction.digest);
      let table = unconfirmed.table;
      if (unconfirmed.action === 'create_game') {
        const opened = result.Transaction.events.find(event => event.eventType.startsWith(`${MODULE}::GnumberOpen<`));
        if (opened) table = { ...table, number: String(decodeBragEvent(opened).result) };
      }
      selectTable(unconfirmed.action === 'leave_game' || unconfirmed.action === 'get_timeout_bets' || table.number === '0' ? null : table);
      setNotice('Transaction confirmed. The table has been recovered.');
      onGetbalan();
    }, true);
  }
  const amountText = (value: string | bigint) => `${formatAmount(value, config.scale)} ${config.symbol}`;
  const lobbyBusy = suiLobby.isFetching || usdcLobby.isFetching;

  function tableCard(table: LobbyTable, mine = false) {
    const tokenConfig = TOKENS[table.token];
    return <article className="brag-room-card" key={`${table.token}:${table.number}`}>
      <div className="brag-room-heading"><span className="brag-token">{tokenConfig.symbol}</span><span>Table #{table.number}</span></div>
      <strong>{formatAmount(table.room.bet, tokenConfig.scale)} <small>{tokenConfig.symbol}</small></strong>
      <span className="brag-muted">{isWaiting(table.room) ? '1 / 2 players · Open seat' : isSettled(table.room) ? 'Round settled' : 'Round in progress'}</span>
      <span className="brag-muted">Max bet {formatAmount(table.room.max_bet, tokenConfig.scale)}</span>
      <button disabled={Boolean(pending) || (!mine && (!address || Boolean(unconfirmed)))} onClick={() => mine ? selectTable(table) : join(table)}>{mine ? 'Resume table' : address ? 'Join table' : 'Connect wallet to join'}</button>
    </article>;
  }

  const feedback = <div className="brag-feedback" aria-label="Transaction updates">
    {error && !(settled && seat > 0) && <div className="brag-message brag-error" role="alert">{error}<button className="brag-secondary" onClick={refresh}>Refresh state</button></div>}
    {notice && <p className="brag-message" role="status">{notice}</p>}
    {pending && <p className="brag-message" role="status" aria-live="polite">{pending} Keep this page open.</p>}
    {unconfirmed && <div className="brag-message" role="status">A signed transaction is awaiting confirmation. New transactions are paused to prevent duplicate stakes.<button disabled={Boolean(pending)} onClick={checkSubmission}>Check transaction</button><a href={`https://suiscan.xyz/mainnet/tx/${unconfirmed.digest}`} target="_blank" rel="noreferrer">View transaction ↗</a></div>}
    {digest && <a className="brag-tx" href={`https://suiscan.xyz/mainnet/tx/${digest}`} target="_blank" rel="noreferrer">View last confirmed transaction ↗</a>}
  </div>;

  return <section className={`brag-game ${active ? 'has-active-table' : ''}`}>
    <div className="brag-page-heading"><div><p className="brag-eyebrow">SUI MAINNET · TWO PLAYER POKER</p><h1>BRAG <span>Play your hand.</span></h1></div>
      <button className="brag-secondary" onClick={refresh} disabled={lobbyBusy}>↻ Refresh</button></div>
    {!active && feedback}
    {active ? <>
      <div className="brag-table-toolbar"><span>Table #{active.number} <b className="brag-token">{config.symbol}</b></span><button className="brag-secondary" disabled={Boolean(pending)} onClick={() => selectTable(null)}>Back to lobby</button></div>
      {roomQuery.isPending && <p className="brag-message" role="status">Loading table…</p>}
      {roomQuery.isError && <p className="brag-message brag-error" role="alert">{isMissingRoom(roomQuery.error) ? 'This table was closed on chain. Return to the lobby or create a new table.' : 'Unable to refresh this table. Previous state is shown; actions are paused until connection recovers.'}</p>}
      {room && <>
        <div className="brag-table">
          <div className={`brag-seat ${room.stage < 10 && actingSeat === (seat === 2 ? 1 : 2) ? 'is-acting is-opponent' : ''}`}><span className="brag-seat-label">{seat ? 'OPPONENT' : 'PLAYER 2'}</span><strong title={opponent}>{short(opponent)}</strong><Cards values={otherCards} label="Opponent cards" /></div>
          <div className="brag-pot"><div className="brag-pot-total"><span className="brag-eyebrow">{settled ? 'ROUND SETTLED' : waiting ? 'WAITING TABLE' : 'TOTAL POT'}</span><strong>{settled ? 'Payout complete' : amountText(room.balance)}</strong>
            {(settled || waiting) && <p role="status">{settled ? `${short(winner)} won this round` : waiting ? 'Open to anyone — share this table number' : ownTurn ? 'Your turn' : seat ? 'Waiting for your opponent' : 'Round in progress'}</p>}</div>
            {room.stage < 10 && <div className={`brag-turn ${ownTurn ? 'is-your-turn' : 'is-opponent-turn'} ${urgent ? 'is-urgent' : ''}`} aria-label="Turn countdown">
              <div className="brag-turn-heading" role="status"><span>{ownTurn ? 'Your turn' : seat ? "Opponent's turn" : `Player ${actingSeat}'s turn`}</span><span className="brag-turn-direction" aria-hidden="true"><span className="brag-arrow-vertical">{actingSeat === (seat || 1) ? '↓' : '↑'}</span><span className="brag-arrow-horizontal">{actingSeat === (seat || 1) ? '→' : '←'}</span></span></div>
              <div className="brag-timer" role="timer" aria-live="off" aria-label={`${turnOwner} time remaining`}><strong>{clockSynced ? `${seconds}s` : '—'}</strong><span>{clockSynced ? seconds > 0 ? `${turnOwner} time remaining` : `${turnOwner} deadline passed` : 'Syncing clock…'}</span></div>
              <div className="brag-time-track" aria-hidden="true"><div style={{ width: `${clockSynced ? Math.min(100, seconds * 100000 / timing.data!.countdown) : 0}%` }} /></div>
              <p>{!clockSynced ? 'Waiting for chain clock' : seconds === 0 ? ownTurn ? 'Your time is up — the opponent can claim timeout' : timeoutReady ? 'Opponent timed out — claim winnings below' : 'Turn deadline passed' : ownTurn ? turnHint : 'Please wait for the other player'}</p>
            </div>}
          </div>
          <div className={`brag-seat ${room.stage < 10 && actingSeat === (seat || 1) ? 'is-acting is-you' : ''}`}><Cards values={myCards} label="Your cards" /><strong>{seat ? 'You' : 'PLAYER 1'}</strong><span className="brag-muted">{seat ? short(address!) : short(room.player1)}{seat && (seat === 1 ? room.vip_p1 : room.vip_p2) ? ' · VIP' : ''}</span></div>
        </div>
        <div className="brag-controls">
          {seat > 0 && !secret && room.stage < 10 && <p className="brag-message brag-error">This browser does not have the cards committed for this round. Use the original browser to reveal or settle. Do not start another round to replace them.</p>}
          {waiting && <p className="brag-muted">{seat ? 'Your stake is on the table. Returning to the lobby keeps this seat open; closing the table refunds your stake.' : `Join for ${amountText(room.bet)}. The empty seat is available to everyone.`}</p>}
          {waiting && !seat && <button disabled={readOnly} onClick={() => join(active)}>Join for {amountText(room.bet)}</button>}
          {settled && seat > 0 && <div className="brag-continue"><label>Next-round ante<input aria-label="Next-round ante" inputMode="decimal" value={nextAnte} onChange={e => setNextAnte(e.target.value)} disabled={Boolean(pending)} /></label><button disabled={readOnly} aria-busy={Boolean(pending)} onClick={continueRound}>Continue · open next round</button>
            <div className="brag-continue-status" aria-live="polite">
              {error && <p className="brag-message brag-error" role="alert">{error}</p>}
              {pending && <p role="status">{pending}</p>}
              {!pending && unconfirmed && <p>Check the previous signed transaction below before starting another round.</p>}
              {!pending && !unconfirmed && !address && <p>Connect your wallet to continue.</p>}
            </div>
            <p className="brag-muted">Min {amountText(room.min_bet)} · Max {amountText(room.max_bet)}. {defaultNextAnte(room, config.scale) !== '1' && `This table does not allow 1 ${config.symbol}; its permitted starting amount is shown above. `}If another player has already opened the next round, you join at their current ante.</p></div>}
          {waiting && !seat && <p className="brag-muted">If your previous opponent continued, this joins their next round. A new player can also take this seat.</p>}
          {seat > 0 && room.stage < 10 && <div className="brag-actions">
            {room.stage < 4 && <>
              <button disabled={readOnly || !ownTurn || !secret || hasSeen(room, address!)} onClick={() => act('apply_look_cards')}>See cards</button>
              <button disabled={readOnly || !ownTurn} onClick={() => act('call')}>Call {amountText(callAmount(room, address!))}</button>
              <div className="brag-raise"><label>Raise amount<input aria-label="Raise amount" inputMode="decimal" value={raise} placeholder={nextTwoDecimalAmount(callAmount(room, address!), config.scale)} onChange={e => { const value = twoDecimalInput(e.target.value); if (value !== null) setRaise(value); }} onBlur={() => setRaise(twoDecimalInput(raise, true) ?? '')} disabled={readOnly || !ownTurn} /></label><button disabled={readOnly || !ownTurn || !raise} onClick={() => act('rasie')}>Raise</button><small>Above {amountText(callAmount(room, address!))}, up to {amountText(maxRaise(room, address!))}</small></div>
              <button className="brag-showdown" disabled={readOnly || !ownTurn || !secret} onClick={() => act('applyOpenCards')}>Showdown {amountText(showdownAmount(room, address!))}</button>
            </>}
            {room.stage === 6 && <button disabled={readOnly || !ownTurn || !secret} onClick={() => act('reveal_look_cards')}>Reveal for opponent</button>}
            {room.stage === 4 && <button disabled={readOnly || !ownTurn || !secret} onClick={() => act('OpenCards')}>Reveal & settle</button>}
            {room.stage === 5 && <button disabled={readOnly || !ownTurn || !secret} onClick={() => act('get_fold_bets')}>Claim fold winnings</button>}
            {room.stage < 5 && <button className="brag-danger" disabled={readOnly || !ownTurn} onClick={() => act('fold')}>Fold</button>}
            {timeoutReady && <button disabled={readOnly} onClick={() => act('get_timeout_bets')}>Claim timeout winnings</button>}
          </div>}
          {seat > 0 && (waiting || settled) && <button className="brag-danger" disabled={readOnly} onClick={() => act('leave_game')}>{waiting ? 'Close table & refund stake' : 'Close empty table'}</button>}
          {room.stage < 10 && <p className="brag-muted">An active round continues on chain if you leave this page. Return before your turn expires.</p>}
        </div>
      </>}
      {feedback}
    </> : <>
      <div className="brag-lobby-layout">
        <div className="brag-lobby-main"><div className="brag-section-heading"><h2>Open tables</h2><div className="brag-filters" aria-label="Filter tables">{(['all', 'sui', 'usdc'] as const).map(value => <button key={value} className={filter === value ? 'is-selected' : 'brag-secondary'} onClick={() => setFilter(value)} aria-pressed={filter === value}>{value.toUpperCase()}</button>)}</div></div>
          {(suiLobby.isError || usdcLobby.isError) && <p className="brag-message brag-error" role="alert">Some tables could not be refreshed ({[suiLobby.isError && 'SUI', usdcLobby.isError && 'USDC'].filter(Boolean).join(', ')}). Previously loaded tables remain visible. Refresh to retry.</p>}
          <div className="brag-room-grid">{openTables.map(table => tableCard(table))}</div>
          {!openTables.length && <div className="brag-empty"><span>♠</span><h3>{suiLobby.isPending || usdcLobby.isPending ? 'Finding open tables…' : suiLobby.isError || usdcLobby.isError ? 'Lobby connection interrupted' : 'The next hand starts with you.'}</h3><p>Create a table, or use a table number to rejoin a game.</p></div>}
          {myTables.length > 0 && <><h2>My tables</h2><div className="brag-room-grid">{myTables.map(table => tableCard(table, true))}</div></>}
        </div>
        <aside className="brag-create"><h2>Create a table</h2><p className="brag-muted">Two players. One shared pot.</p><form onSubmit={createTable}><fieldset disabled={Boolean(pending) || Boolean(unconfirmed)}>
          <label>Token<select value={token} onChange={e => setToken(e.target.value as Token)}><option value="sui">SUI</option><option value="usdc">USDC</option></select></label>
          <label>Ante<input aria-label="Ante" inputMode="decimal" value={ante} onChange={e => setAnte(e.target.value)} required /></label>
          <label>Maximum blind bet<input aria-label="Maximum blind bet" inputMode="decimal" value={maximum} onChange={e => setMaximum(e.target.value)} required /></label>
          <p className="brag-muted">Seen players can raise up to twice the blind maximum.</p>
          <button type="submit" disabled={!address}>{address ? 'Create table' : 'Connect wallet to create'}</button>
        </fieldset></form>
        <form onSubmit={openByNumber} className="brag-recover"><label>Open table by number<input aria-label="Table number" inputMode="numeric" value={roomInput} onChange={e => setRoomInput(e.target.value)} placeholder="e.g. 42" required /></label><span className="brag-muted">Using {TOKENS[token].symbol} selected above.</span><button className="brag-secondary" disabled={Boolean(pending)}>Open table</button></form>
        <p className="brag-muted">Keep this browser's saved data until your round settles. Your private deck stays on this device.</p>
        </aside>
      </div>
    </>}
  </section>;
}
