import type { PoolBrief, UnifiedQuoteResult } from '../../shared';
import type { ArbSummaryBestBuyRow, ArbSummaryBestSellRow, ArbSummaryResult } from './types';

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

function toPoolBrief(row: ArbSummaryBestBuyRow | ArbSummaryBestSellRow | undefined): PoolBrief | null {
  if (!row?.pool) return null;
  return {
    dex: row.dex,
    version: row.version,
    poolAddress: row.pool,
  };
}

export function arbSummaryToUnified(input: ArbSummaryToUnifiedInput): UnifiedQuoteResult {
  const { summary, source, token0, token1, latencyMs } = input;

  const amountKey = summary.bestBuyRows[0]?.amount ?? summary.bestSellRows[0]?.amount;
  const bestBuyRow = summary.bestBuyRows.find((row) => row.amount === amountKey) ?? summary.bestBuyRows[0];
  const bestSellRow = summary.bestSellRows.find((row) => row.amount === amountKey) ?? summary.bestSellRows[0];

  const askPrice = parsePrice(bestBuyRow?.bestBuyPriceOutPerIn ?? '');
  const bidPrice = parsePrice(bestSellRow?.bestSellPriceOutPerIn ?? '');

  if (!askPrice || !bidPrice) {
    return {
      sourceType: 'dex',
      source,
      token0,
      token1,
      ok: false,
      latencyMs,
      error: summary.arbLines[0] ?? 'No valid best buy/sell rows in arb summary',
      timestamp: Date.now(),
      bidPrice: 0,
      askPrice: 0,
      midPrice: 0,
      spread: 0,
      spreadPct: 0,
      bestBuyPool: toPoolBrief(bestBuyRow),
      bestSellPool: toPoolBrief(bestSellRow),
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
    bestBuyPool: toPoolBrief(bestBuyRow),
    bestSellPool: toPoolBrief(bestSellRow),
  };
}

