import { ethers } from "ethers";
import type { PoolQuoteMeta } from "./configQuoteInput";
import type { ArbSummaryCandidate } from "./buildArbSummary";

export type ImpactQuoteResultStruct = {
  amountOut: bigint;
  referenceAmountOut: bigint;
  outPerInX18: bigint;
  referenceOutPerInX18: bigint;
  priceImpactPpm: bigint;
  sellAmountOut: bigint;
  profit: bigint;
  canTradeAmountIn: boolean;
  success: boolean;
};

export type ConfigImpactQuoteItemStruct = {
  index: bigint;
  pool: string;
  kind: bigint;
  buy: ImpactQuoteResultStruct;
  sell: ImpactQuoteResultStruct;
  buyAmountOutHumanX18: bigint;
  sellAmountOutHumanX18: bigint;
  buyPriceOutPerInX18: bigint;
  sellPriceOutPerInX18: bigint;
  sellEnabled: boolean;
  success: boolean;
};

export type ConfigImpactQuoteBatchResultStruct = {
  quotes: ConfigImpactQuoteItemStruct[];
  blockNumber: bigint;
  gasUsed: bigint;
};

export type QuoteTableRow = Record<string, string | boolean | number>;

type BuildQuoteRowsFromResultOptions = {
  result: ConfigImpactQuoteBatchResultStruct;
  poolMetas: PoolQuoteMeta[];
  amountInHuman: string;
  amountOutHuman?: string;
  inSymbol: string;
  outSymbol: string;
  includeRevertHint: boolean;
};

function formatUnitsFixed(value: bigint, decimals: number, precision = 6): string {
  const num = Number(ethers.formatUnits(value, decimals));
  if (!Number.isFinite(num)) return ethers.formatUnits(value, decimals);
  if (num === 0) return "0";
  if (Math.abs(num) < 0.000001) return num.toExponential(4);
  return num.toFixed(precision);
}

function x18Number(value: bigint): number {
  const num = Number(ethers.formatUnits(value, 18));
  return Number.isFinite(num) ? num : NaN;
}

function formatNumberFixed(value: number, precision = 6): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value === 0) return "0";
  if (Math.abs(value) < 0.000001) return value.toExponential(4);
  return value.toFixed(precision);
}

function impactLevel(priceImpactPpm: bigint): string {
  const ppm = Number(priceImpactPpm);
  if (ppm >= 100_000) return "CRITICAL >10%";
  if (ppm >= 50_000) return "VERY_HIGH <=10%";
  if (ppm >= 10_000) return "HIGH <=5%";
  if (ppm >= 3_000) return "MEDIUM <=1%";
  if (ppm >= 1_000) return "LOW <=0.3%";
  return "OK <0.1%";
}

export function buildQuoteRowsFromResult(options: BuildQuoteRowsFromResultOptions) {
  const {
    result,
    poolMetas,
    amountInHuman,
    amountOutHuman,
    inSymbol,
    outSymbol,
    includeRevertHint,
  } = options;

  const tableRows: QuoteTableRow[] = [];
  const arbSummaryCandidates: ArbSummaryCandidate[] = [];
  let successQuotesCount = 0;

  for (let i = 0; i < result.quotes.length; i++) {
    const item = result.quotes[i];
    const meta = poolMetas[i];
    if (item.success) successQuotesCount++;

    const buyPriceOutPerIn = x18Number(item.buyPriceOutPerInX18);
    const sellPriceOutPerIn = item.sellEnabled ? x18Number(item.sellPriceOutPerInX18) : NaN;

    if (item.buy.success && item.sellEnabled && item.sell.success && amountOutHuman) {
      arbSummaryCandidates.push({
        amountIn: `${amountInHuman} ${inSymbol}`,
        amountOut: `${amountOutHuman} ${outSymbol}`,
        dex: meta.dex,
        version: meta.version,
        pool: meta.poolAddress,
        bestBuyPriceOutPerIn: sellPriceOutPerIn,
        bestSellPriceOutPerIn: buyPriceOutPerIn,
      });
    }

    tableRows.push({
      dex: meta.dex,
      version: meta.version,
      pool: meta.poolAddress,
      kind: Number(item.kind),
      buyAmountIn: `${amountInHuman} ${inSymbol}`,
      buyAmountOut: `${formatUnitsFixed(item.buyAmountOutHumanX18, 18)} ${outSymbol}`,
      buyPriceOutPerIn: formatNumberFixed(buyPriceOutPerIn),
      buyImpactPpm: item.buy.priceImpactPpm.toString(),
      buyImpactLevel: impactLevel(item.buy.priceImpactPpm),
      sellEnabled: item.sellEnabled,
      sellAmountIn: item.sellEnabled && amountOutHuman ? `${amountOutHuman} ${outSymbol}` : "disabled",
      sellAmountOut: item.sellEnabled ? `${formatUnitsFixed(item.sellAmountOutHumanX18, 18)} ${inSymbol}` : "n/a",
      sellPriceOutPerIn: item.sellEnabled ? formatNumberFixed(sellPriceOutPerIn) : "n/a",
      sellImpactPpm: item.sellEnabled ? item.sell.priceImpactPpm.toString() : "n/a",
      sellImpactLevel: item.sellEnabled ? impactLevel(item.sell.priceImpactPpm) : "n/a",
      buySuccess: item.buy.success,
      sellSuccess: item.sellEnabled ? item.sell.success : "n/a",
      success: item.success,
      ...(includeRevertHint ? { revertHint: "" } : {}),
    });
  }

  return {
    tableRows,
    arbSummaryCandidates,
    successQuotesCount,
    totalQuotesCount: result.quotes.length,
  };
}
