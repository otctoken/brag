# BRAG

React + Vite frontend for the BRAG Move contract on Sui mainnet.

## Run

Node.js 22 or newer is required by Sui SDK 2.x.

```sh
npm ci
npm run dev
```

## Validate

```sh
npm run typecheck
npm test
npm run build
```

## Sui 2.x / gRPC migration

The application pins `@mysten/sui` to `2.36.0` and `@mysten/dapp-kit-react` to `2.1.40`, including the lockfile.

Current-state reads and transaction execution share the gRPC client in `src/suiClient.ts`:

```ts
import { SuiGrpcClient } from '@mysten/sui/grpc';

export const client = new SuiGrpcClient({
  network: 'mainnet',
  baseUrl: 'https://fullnode.mainnet.sui.io:443',
});
```

- Wallet connection uses `DAppKitProvider` with this same mainnet client.
- Transactions use `Transaction` and explicit `u64`, `ID` and `vector<u8>` arguments. The wallet signs; the application submits the signed bytes through gRPC, checks transaction failure, and waits for availability before updating the UI.
- All seven funded game actions use `tx.coin({ balance, type })` for SUI and USDC. Coin selection, address balances and any required coin merging are resolved by the SDK during wallet serialization, rather than by the page. Displayed token amounts convert to exact bigint base units before creating payment coins.
- Balance reads consume the new nested balance response. Coin, owned-object and dynamic-field reads paginate.
- Room objects use `getDynamicObjectField` with a BCS-encoded u64 key. Room and event payloads are decoded using the layouts in `contract/brag.move`.
- Historical events (bet history and room discovery) and OpenCards transaction searches use the official GraphQL indexer configured in `src/historyClient.ts`. Events and timestamps arrive together in paginated queries, newest-first. OpenCards recovery reads the Move call arguments instead of relying on fixed input offsets.
- The old `@mysten/sui.js`, legacy dApp Kit, random JSON-RPC endpoints and JSON-RPC calls have been removed.

## Historical records

The public fullnode can return an empty list for old events even though the indexer still has those records. History therefore uses `https://graphql.mainnet.sui.io/graphql`; it does not use the fullnode's historical list APIs. Optionally set `VITE_SUI_GRAPHQL_URL` at build time to use another compatible, browser-accessible mainnet GraphQL indexer. Do not put private API keys in Vite environment variables.

The table loads immediately, refreshes every 15 seconds, and displays the latest 120 SUI/USDC events combined. Rows are identified by transaction digest **and event sequence**, so multiple events from one transaction are preserved. Query failures show a retry message and preserve already-loaded rows; an empty successful result shows “No bets found” instead of an invented `0x0` record. `Multiplier` remains `--` because the contract's `Gvol` event does not contain a multiplier.

## Validation and limitations

The 2026-10-15 `tx.coin` update passes 38 offline tests, TypeScript checking and the production build. Payment tests execute all seven page handlers for both SUI and USDC, including both join targets and blind/seen betting rules. SDK serialization is exercised for SUI gas fallback, address balances, paginated USDC coins and insufficient funds. These tests do not sign transactions or execute games on mainnet.

Automated tests cover BCS payload decoding, indexed-history routing and backward pagination, GraphQL failures, event-level deduplication, token amount formatting, kiosk child IDs, transaction-input decoding and failed-transaction handling. Read-only mainnet checks verified balances and decoding of room 2 under the configured SUI game object.

On 2026-10-12, the corrected indexed-history query returned 30 real bet events for the configured contract. The latest returned event was on 2026-03-07, with a payout of 1.99 SUI (transaction `EsF82tUXs6wSXkBv1t3StyXAZMpBKizB86hrVt7qCgr4`). Indexer freshness and historical coverage remain provider-dependent. There is no JSON-RPC fallback.

No wallet was connected and no real-money transaction was signed or submitted during verification. Actual wallet signing and contract execution still need an end-to-end check by the operator. The Move contract and its existing game rules were not changed.

Official references: [SuiGrpcClient](https://sdk.mystenlabs.com/sui/clients/grpc), [JSON-RPC migration](https://sdk.mystenlabs.com/sui/migrations/sui-2.0/json-rpc-migration).
