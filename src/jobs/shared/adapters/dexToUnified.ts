import { UnifiedQuoteResult, PoolBrief } from '../types';
import type { DexQuotesByArbQuoteResult, PoolQuoteResult } from '../../getDexQuotesByArbQuoter/helpers/types';

const DEFAULT_DEX_SOURCE: UnifiedQuoteResult['source'] = 'dex:arbitrum';

function toPoolBrief(pq: PoolQuoteResult | null): PoolBrief | null {
  if (!pq) return null;
  return {
    dex: pq.dex,
    version: pq.version,
    poolAddress: pq.poolAddress,
    feePpm: pq.feePpm,
  };
}

/**
 * Маппит нативный результат DEX-джобы (DexQuotesByArbQuoteResult) в UnifiedQuoteResult.
 *
 * Маппинг цен:
 *   bestBuyPrice  (цена покупки base)  → askPrice  (по ней можно купить)
 *   bestSellPrice (цена продажи base)  → bidPrice  (по ней можно продать)
 *
 * @param result — результат getDexQuotes
 * @param token0 — базовый токен (адрес 0x…)
 * @param token1 — котировочный токен (адрес 0x…)
 * @param source — имя DEX-источника в unified-формате
 */
export function dexToUnified(
  result: DexQuotesByArbQuoteResult,
  token0: string,
  token1: string,
  source: UnifiedQuoteResult['source'] = DEFAULT_DEX_SOURCE,
): UnifiedQuoteResult {
  if (!result.ok) {
    return {
      sourceType: 'dex',
      source,
      token0,
      token1,
      ok: false,
      latencyMs: result.latencyMs,
      error: result.error,
      timestamp: Date.now(),
      bidPrice: 0,
      askPrice: 0,
      midPrice: 0,
      spread: 0,
      spreadPct: 0,
      blockNumber: result.blockNumber,
      poolsCount: result.filteredPairsCount,
    };
  }

  const bidPrice = result.bestSellPrice;  // цена продажи base → bid
  const askPrice = result.bestBuyPrice;   // цена покупки base → ask
  const midPrice = bidPrice > 0 && askPrice > 0
    ? (bidPrice + askPrice) / 2
    : 0;
  const spread = askPrice - bidPrice;
  const spreadPct = midPrice > 0 ? (spread / midPrice) * 100 : 0;

  return {
    sourceType: 'dex',
    source,
    token0,
    token1,
    ok: true,
    latencyMs: result.latencyMs,
    timestamp: Date.now(),
    bidPrice,
    askPrice,
    midPrice,
    spread,
    spreadPct,
    blockNumber: result.blockNumber,
    gasUsed: result.bestBuy?.gasUsed ?? result.bestSell?.gasUsed,
    poolsCount: result.filteredPairsCount,
    bestBuyPool: toPoolBrief(result.bestBuy),
    bestSellPool: toPoolBrief(result.bestSell),
  };
}

