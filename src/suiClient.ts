import { SuiGrpcClient } from '@mysten/sui/grpc';

export const client = new SuiGrpcClient({
  network: 'mainnet',
  baseUrl: import.meta.env?.VITE_SUI_GRPC_URL || 'https://fullnode.mainnet.sui.io:443',
});
