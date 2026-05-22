export const toAmount = (value: number, decimals: number): bigint => {
  return BigInt(Math.floor(value * 10 ** decimals));
};

