# BRAG

React + Vite frontend for the BRAG Move game on Sui mainnet.

## Run

Node.js 22 or newer is required.

```sh
npm ci
npm run dev
```

The contract remains `0x93a36744eff6ee002ef32948866098eae032f277e7e702133dd35dc7cbfe1681::brag`.
SUI/USDC game objects and the NFT type are centralized in `src/gameConfig.ts`.
No Move source or deployed contract was changed by the frontend update.

## Continuing a game and public tables

- After settlement (`stage` 11 or 12), either participant can fund the next round with `go_on_playing`.
- The next-round ante input prefers 1 SUI or 1 USDC, rather than carrying over the last round's raised bet. If 1 is outside the table's on-chain range, it starts at the nearest permitted limit: a table created with a 4 SUI minimum starts its next round at 4 SUI. The input remains editable; out-of-range errors appear beside Continue before a wallet request. Starting at 1 requires a new table when the existing minimum is higher.
- That transaction clears the other seat and sets `stage` 10. The empty seat is public: the previous opponent or any other wallet can join. It is not reserved for a rematch.
- The frontend re-reads the table before continuing. If another participant already opened the next round, it joins using **the current `bet`**, not `min_bet`. If the wallet is already seated, it resumes without paying again.
- Both empty-seat positions use `join_playing`, including newly created tables. Its seven arguments include the kiosk and NFT ID required by the contract.
- The lobby reads current dynamic objects, paginates them and batches object reads. Historical `GnumberClose` events no longer permanently hide a table that reopened later.
- **Back to lobby** is navigation only. The table remains available. **Close table & refund stake** calls `leave_game`, which deletes the entire waiting table and returns its stake to its owner. Closing a settled table also deletes it. An active round must settle or time out first.
- `My tables` and a token-specific table-number input support recovery after refresh or navigation. A closed table is reported explicitly rather than silently resetting to table zero.

## Reliability and private cards

- The chain determines stages, seats and available actions; polling continues after settlement. Refetches are isolated by token/table and are cancelled when appropriate.
- Stakes, limits, call and showdown amounts use bigint base units. Decimal inputs and displays preserve the full token precision.
- Countdown configuration comes from `GameData`; time is synchronized to Sui's Clock rather than trusting a fixed 60-second browser timer. Timeout eligibility is checked again before submission.
- New decks use cryptographic randomness. Secrets are persisted **before signing**, indexed by mainnet/wallet/token/commitment, so a cancelled next round cannot overwrite an existing round's cards.
- Legacy `randomKey` / `randomPoker` storage is migrated only if its signature matches the on-chain commitment. Missing/corrupt storage does not crash rendering; funding is blocked if durable storage is unavailable.
- Wallet changes remount the game session. Rapid clicks and concurrent tabs are guarded. Cancellation preserves the visible table. Lost submission responses retain the signed transaction digest and block further payments until checked (or the signed epoch validity expires and the node confirms absence).
- Confirmed execution remains successful if a subsequent read/indexing wait times out. No transaction is automatically resubmitted.
- Historical showdown cards must match the opponent and this round's BLS commitment. History searches are bounded to the latest 120 OpenCards transactions; older results may remain face-down, without affecting chain payouts or continued play.

Private decks remain in browser local storage. Keep that browser's data until the round settles. These are game secrets, not wallet private keys; the frontend never stores wallet signing keys. Changing devices cannot reconstruct a deck that was never published.

## Layout

The lobby and table use responsive grids, wrapping controls, readable cards, 44px minimum action targets and reduced-motion support. The sidebar collapses on smaller screens; bet-history scrolling is contained within its table. Browser checks cover 320, 390, 768 and 1440px widths.

The countdown names the acting player, highlights their seat and shows a time bar. Your turn is green, the opponent's turn is blue, and your final ten seconds use a warning color. Transaction feedback sits below the table controls so wallet requests do not push the table down. Wallet return restores the previous scroll position unless the player deliberately scrolls or navigates away. Browser regressions simulate popup focus changes, successful confirmation and cancellation; real extension behavior still depends on the wallet.

Active tables use a compact countdown. Desktop seats are centered above and below the pot, with card heights adapting from 110–142px to the viewport and the table heading sharing one row with navigation. Phone cards remain 78px wide with labels beside lightly overlapping cards; tablet layouts retain side-by-side seats. Layout tests include the application header and content spacing, checking that the normal active table and all actions fit at 1280×720, 1366×768, 1440×900, 1920×1080, 1024×768, 768×1024, 390×844 and 430×932. Smaller viewports, zoomed text and extra recovery messages can still require scrolling; controls are not clipped to force a fit.

## Validation

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:ui
```

To use an already installed Edge on Windows:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
$env:NO_PROXY = '127.0.0.1,localhost'
npm run test:ui
```

Browser tests run against an isolated Vite fixture on port 4174 with simulated wallets and chain responses. They exercise actual component clicks and transaction construction, including continuation races, rejection, duplicate clicks, deleted tables, persisted unconfirmed submissions and device widths. Fixture aliases are only in `tests/ui/vite.config.ts`; production uses the real wallet and RPC.

Optional read-only integration checks:

```sh
npx tsx tests/check-mainnet.mts
# Start the real app on port 4175 before running the following Edge check:
npm run dev -- --host 127.0.0.1 --port 4175
# In another terminal:
npx tsx tests/check-browser.mts
```

No real wallet transaction is signed or submitted by these checks. Production wallet prompts and economic execution should still be verified by the operator before release.

## RPC and history

`@mysten/sui` is pinned to 2.36.0 and `@mysten/dapp-kit-react` to 2.1.40. Wallet connection, current state reads and transaction submission share the gRPC client in `src/suiClient.ts`. Historical events use the GraphQL indexer in `src/historyClient.ts`.

Optional build-time variables are shown in `.env.example`. Use compatible **mainnet** endpoints. Vite environment values are public in the browser; do not put private API keys in them. A dedicated provider can reduce public endpoint rate limits. Query errors preserve existing data and show retry information rather than claiming that no tables exist.

Bet history merges the latest 120 SUI/USDC events, deduplicated by digest and event sequence. `Multiplier` remains `--` because the contract's event does not contain that value.

Official references: [Sui gRPC client](https://sdk.mystenlabs.com/sui/clients/grpc), [Sui 2.0 migration](https://sdk.mystenlabs.com/sui/migrations/sui-2.0/json-rpc-migration).
