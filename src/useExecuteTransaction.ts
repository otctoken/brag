import { useDAppKit } from '@mysten/dapp-kit-react';
import type { Transaction } from '@mysten/sui/transactions';
import { fromBase64 } from '@mysten/sui/utils';
import { client } from './suiClient';
import { decodeBragEvent, requireSuccess } from './bragChain';

export function useExecuteTransaction() {
  const dAppKit = useDAppKit();
  return async ({ transaction }: { transaction: Transaction }) => {
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
    const result = await client.executeTransaction({
      transaction: fromBase64(bytes), signatures: [signature],
      include: { effects: true, events: true, balanceChanges: true },
    });
    const executed = requireSuccess(result);
    await client.waitForTransaction({ digest: executed.digest });
    return { ...executed, events: executed.events.map(event => ({ ...event, parsedJson: decodeBragEvent(event) })) };
  };
}
