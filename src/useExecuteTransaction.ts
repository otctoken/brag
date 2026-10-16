import { useDAppKit } from '@mysten/dapp-kit-react';
import type { Transaction } from '@mysten/sui/transactions';
import { client } from './suiClient';
import { submitSigned } from './submitTransaction';

export function useExecuteTransaction() {
  const dAppKit = useDAppKit();
  return async ({ transaction, onSigned }: { transaction: Transaction; onSigned?: (digest: string) => void }) => {
    // ===== 新增：设置 ValidDuring.nonce =====
    const [{ systemState }, { chainIdentifier }] = await Promise.all([
      client.getCurrentSystemState(),
      client.getChainIdentifier(),
    ]);

    const epoch = Number(systemState.epoch);

    transaction.setExpiration({
      ValidDuring: {
        minEpoch: epoch,
        maxEpoch: epoch + 1,
        minTimestamp: null,
        maxTimestamp: null,
        chain: chainIdentifier,
        nonce: globalThis.crypto.getRandomValues(new Uint32Array(1))[0],
      },
    });
    // ===== 新增结束 =====
    const { bytes, signature } = await dAppKit.signTransaction({ transaction, network: 'mainnet' });
    return submitSigned(bytes, signature, onSigned);
  };
}
