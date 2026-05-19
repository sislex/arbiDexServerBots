import { ethers } from 'ethers';
import { DeployedImpactQuoteStabsConfig } from './types';

export function parseAmountList(defaultAmountIn: number): string[] {
  const raw = process.env.AMOUNTS_IN ?? process.env.AMOUNT_IN ?? String(defaultAmountIn);

  const amounts = raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  if (!amounts.length) {
    throw new Error('AMOUNTS_IN/AMOUNT_IN must contain at least one value');
  }

  return amounts;
}

export function formatUnitsFixed(value: bigint, decimals: number, precision = 6): string {
  const num = Number(ethers.formatUnits(value, decimals));
  if (!Number.isFinite(num)) return ethers.formatUnits(value, decimals);
  if (num === 0) return '0';
  if (Math.abs(num) < 0.000001) return num.toExponential(4);
  return num.toFixed(precision);
}

export function ratioNumber(numerator: bigint, numeratorDecimals: number, denominatorHuman: string): number {
  const num = Number(ethers.formatUnits(numerator, numeratorDecimals));
  const den = Number(denominatorHuman);

  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return Number.NaN;
  return num / den;
}

export function formatNumberFixed(value: number, precision = 6): string {
  if (!Number.isFinite(value)) return 'n/a';
  if (value === 0) return '0';
  if (Math.abs(value) < 0.000001) return value.toExponential(4);
  return value.toFixed(precision);
}

export function resolvePair(config: DeployedImpactQuoteStabsConfig): { tokenIn: string; tokenOut: string } {
  const tokenIn = config.token0 ?? config.opts?.tokenIn?.address;
  const tokenOut = config.token1 ?? config.opts?.tokenOut?.address;

  if (!tokenIn || !tokenOut) {
    throw new Error('Missing token addresses: set token0/token1 or opts.tokenIn/out.address in config');
  }

  return { tokenIn, tokenOut };
}

export function baseFailureRow(
  dex: string,
  version: string,
  pool: string,
  outSymbol: string,
  revertHint: string,
  includeRevertHint: boolean,
) {
  return {
    dex,
    version,
    pool,
    amountOut: `0 ${outSymbol}`,
    sellAmountOut: `0 ${outSymbol}`,
    priceOutPerIn: '0',
    sellPriceOutPerIn: '0',
    priceImpactPpm: '0',
    impactLevel: 'REVERT',
    canTradeAmountIn: false,
    success: false,
    ...(includeRevertHint ? { revertHint } : {}),
  };
}

