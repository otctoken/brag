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

The application uses `@mysten/sui ^2.35.0` and `@mysten/dapp-kit-react`. The minimum SDK version is intentional: the migration uses the gRPC `listEvents` and `listTransactions` APIs available in this release. The lockfile pins the installed versions.

All chain access shares the client in `src/suiClient.ts`:

```ts
import { SuiGrpcClient } from '@mysten/sui/grpc';

export const client = new SuiGrpcClient({
  network: 'mainnet',
  baseUrl: 'https://fullnode.mainnet.sui.io:443',
});
```

- Wallet connection uses `DAppKitProvider` with this same mainnet client.
- Transactions use `Transaction` and explicit `u64`, `ID` and `vector<u8>` arguments. The wallet signs; the application submits the signed bytes through gRPC, checks transaction failure, and waits for availability before updating the UI.
- Balance reads consume the new nested balance response. Coin, owned-object and dynamic-field reads paginate.
- Room objects use `getDynamicObjectField` with a BCS-encoded u64 key. Room and event payloads are decoded using the layouts in `contract/brag.move`.
- Event and transaction queries run newest-first and follow scan/page cursors. Event timestamps come from the emitting transaction. OpenCards recovery reads the Move call arguments instead of relying on fixed input offsets.
- The old `@mysten/sui.js`, legacy dApp Kit, random JSON-RPC endpoints and JSON-RPC calls have been removed.

## Validation and limitations

Automated tests cover BCS payload decoding, pagination (including empty scan-limited pages), kiosk child IDs, transaction-input decoding and failed-transaction handling. Read-only mainnet checks verified balances and decoding of room 2 under the configured SUI game object. The browser smoke check verified the home page, game page and wallet selection dialog without runtime errors.

On 2026-10-12, the configured fullnode returned empty results for this contract's historical event/OpenCards transaction queries, while its current room object remained readable. Empty history is not evidence that the contract was never used. Historical bet lists, event-derived room discovery and old OpenCards recovery depend on the history that the provider serves; complete historical coverage may require an archival/indexed provider. This migration does not silently fall back to JSON-RPC.

No wallet was connected and no real-money transaction was signed or submitted during verification. Actual wallet signing and contract execution still need an end-to-end check by the operator. The Move contract and its existing game rules were not changed.

Official references: [SuiGrpcClient](https://sdk.mystenlabs.com/sui/clients/grpc), [JSON-RPC migration](https://sdk.mystenlabs.com/sui/migrations/sui-2.0/json-rpc-migration).
