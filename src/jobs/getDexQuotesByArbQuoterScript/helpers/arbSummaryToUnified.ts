import type { PoolBrief, UnifiedQuoteResult } from '../../shared';
import type {
  ArbSummaryBestBuyRow,
  ArbSummaryBestSellRow,
  ArbSummaryResult,
} from './types';

type ArbSummaryToUnifiedInput = {
  summary: ArbSummaryResult;
  source: UnifiedQuoteResult['source'];
  token0: string;
  token1: string;
  latencyMs: number;
};

function parsePrice(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function invertPrice(value: number | null): number | null {
  if (!value || value <= 0) return null;
  return 1 / value;
}

function toPoolBrief(
  row: ArbSummaryBestBuyRow | ArbSummaryBestSellRow | undefined,
): PoolBrief | null {
  if (!row?.pool) return null;
  return {
    dex: row.dex,
    version: row.version,
    poolAddress: row.pool,
  };
}

export function arbSummaryToUnified(
  input: ArbSummaryToUnifiedInput,
): UnifiedQuoteResult {
  const { summary, source, token0, token1, latencyMs } = input;

  const amountKey =
    summary.bestBuyRows[0]?.amount ?? summary.bestSellRows[0]?.amount;
  const bestBuyRow =
    summary.bestBuyRows.find((row) => row.amount === amountKey) ??
    summary.bestBuyRows[0];
  const bestSellRow =
    summary.bestSellRows.find((row) => row.amount === amountKey) ??
    summary.bestSellRows[0];

  const contractSellPriceOutPerIn = parsePrice(
    bestBuyRow?.bestBuyPriceOutPerIn ?? '',
  );
  const contractBuyPriceOutPerIn = parsePrice(
    bestSellRow?.bestSellPriceOutPerIn ?? '',
  );

  if (!contractSellPriceOutPerIn || !contractBuyPriceOutPerIn) {
    const detail =
      summary.arbLines.find((line) => line && !line.startsWith('fallback')) ??
      summary.arbLines[0];
    return {
      sourceType: 'dex',
      source,
      token0,
      token1,
      ok: false,
      latencyMs,
      error:
        detail ??
        'No valid best buy/sell rows in arb summary (need successful buy+sell quotes; check amountOut and pool compatibility)',
      timestamp: Date.now(),
      bidPrice: 0,
      askPrice: 0,
      midPrice: 0,
      spread: 0,
      spreadPct: 0,
      bestBuyPool: toPoolBrief(bestSellRow),
      bestSellPool: toPoolBrief(bestBuyRow),
    };
  }

  const bidPrice = invertPrice(contractSellPriceOutPerIn);
  const askPrice = invertPrice(contractBuyPriceOutPerIn);

  if (!askPrice || !bidPrice) {
    return {
      sourceType: 'dex',
      source,
      token0,
      token1,
      ok: false,
      latencyMs,
      error: 'Invalid inverted DEX price while building unified quote',
      timestamp: Date.now(),
      bidPrice: 0,
      askPrice: 0,
      midPrice: 0,
      spread: 0,
      spreadPct: 0,
      bestBuyPool: toPoolBrief(bestSellRow),
      bestSellPool: toPoolBrief(bestBuyRow),
    };
  }

  const midPrice = (bidPrice + askPrice) / 2;
  const spread = askPrice - bidPrice;
  const spreadPct = midPrice > 0 ? (spread / midPrice) * 100 : 0;

  return {
    sourceType: 'dex',
    source,
    token0,
    token1,
    ok: true,
    latencyMs,
    timestamp: Date.now(),
    bidPrice,
    askPrice,
    midPrice,
    spread,
    spreadPct,
    bestBuyPool: toPoolBrief(bestSellRow),
    bestSellPool: toPoolBrief(bestBuyRow),
  };
}
