// Truncate extra typed/pasted digits; never round a player's stake upward.
export function twoDecimalInput(value: string, pad = false): string | null {
  if (!/^\d*(?:\.\d*)?$/.test(value)) return null;
  if (!value) return '';
  const [whole, fraction] = value.split('.');
  if (fraction === undefined && !pad) return whole;
  return `${whole || '0'}.${pad ? (fraction ?? '').slice(0, 2).padEnd(2, '0') : fraction!.slice(0, 2)}`;
}

// The first amount with two decimals strictly above the current call amount.
export function nextTwoDecimalAmount(amount: bigint, scale: number): string {
  const hundredths = amount / (BigInt(scale) / 100n) + 1n;
  return `${hundredths / 100n}.${String(hundredths % 100n).padStart(2, '0')}`;
}

// Convert displayed token units without multiplying floating-point amounts.
export function toBaseUnits(amount: number | string, scale: number): bigint {
  const decimals = Math.log10(scale);
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 19) {
    throw new Error('Invalid token scale');
  }
  if (typeof amount === 'number' && (!Number.isFinite(amount) || amount > Number.MAX_SAFE_INTEGER)) {
    throw new Error('Amount must be finite and safely represented');
  }
  const match = /^(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(String(amount));
  if (!match) throw new Error('Invalid token amount');
  const [, whole, fraction = '', exponent = '0'] = match;
  const shift = decimals + Number(exponent) - fraction.length;
  if (!Number.isSafeInteger(shift) || Math.abs(shift) > 255) {
    throw new Error('Token amount is out of range');
  }
  const digits = BigInt(whole + fraction);
  const divisor = shift < 0 ? 10n ** BigInt(-shift) : 1n;
  if (digits % divisor !== 0n) throw new Error('Amount exceeds token decimal precision');
  const balance = shift < 0 ? digits / divisor : digits * 10n ** BigInt(shift);
  if (balance > 18446744073709551615n) throw new Error('Amount exceeds u64 balance');
  return balance;
}
