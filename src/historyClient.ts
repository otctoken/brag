import { SuiGraphQLClient } from '@mysten/sui/graphql';

// Historical queries need the indexer: the public fullnode may return no old events.
// Balances, objects, wallet transaction building and execution still use suiClient.ts.
export const historyClient = new SuiGraphQLClient({
  network: 'mainnet',
  url: import.meta.env?.VITE_SUI_GRAPHQL_URL || 'https://graphql.mainnet.sui.io/graphql',
});
