// --- helper для bigint | string
export const toBigIntSafe = (v: bigint | string | undefined): bigint | undefined => {
  if (v === undefined) return undefined;
  return typeof v === 'bigint' ? v : BigInt(v);
};
