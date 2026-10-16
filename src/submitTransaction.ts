import { Transaction } from '@mysten/sui/transactions';
import { fromBase64 } from '@mysten/sui/utils';
import { client } from './suiClient';
import { decodeBragEvent, requireSuccess } from './bragChain';

export class UncertainTransaction extends Error {
  constructor(public digest: string) {
    super('Transaction submitted, but confirmation is unavailable. Check this transaction before sending another.');
  }
}

export async function submitSigned(bytes: string, signature: string, onSigned?: (digest: string) => void) {
  const digest = await Transaction.from(bytes).getDigest();
  onSigned?.(digest);
  let result;
  try {
    result = await client.executeTransaction({ transaction: fromBase64(bytes), signatures: [signature],
      include: { effects: true, events: true, balanceChanges: true } });
  } catch {
    // The server may have executed it even if the response was lost.
    throw new UncertainTransaction(digest);
  }
  const executed = requireSuccess(result);
  // Execution success is authoritative. Indexer/read availability is a separate
  // concern and must not turn a successful payment into a retryable failure.
  try { await client.waitForTransaction({ digest: executed.digest, timeout: 10000 }); } catch { /* Poll the table next. */ }
  return { ...executed, events: (executed.events ?? []).map(event => ({ ...event, parsedJson: decodeBragEvent(event) })) };
}
