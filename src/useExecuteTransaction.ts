import { useDAppKit } from '@mysten/dapp-kit-react';
import type { Transaction } from '@mysten/sui/transactions';
import { fromBase64 } from '@mysten/sui/utils';
import { client } from './suiClient';
import { decodeBragEvent, requireSuccess } from './bragChain';

export function useExecuteTransaction() {
  const dAppKit = useDAppKit();
  return async ({ transaction }: { transaction: Transaction }) => {
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
