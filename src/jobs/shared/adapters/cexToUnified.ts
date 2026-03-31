import { QuoteSourceName, UnifiedQuoteResult } from '../types';

/**
 * Общий shape для внутренней котировки любой CEX-биржи.
 * Все 6 бирж (Binance, MEXC, Bybit, OKX, KuCoin, Gate.io) возвращают
 * объект с этими полями.
 */
interface CexQuoteLike {
  symbol: string;
  bidPrice: number;
  bidQty: number;
  askPrice: number;
  askQty: number;
  midPrice: number;
  spread: number;
  spreadPct: number;
  latencyMs: number;
}

interface CexResultLike {
  ok: boolean;
  latencyMs: number;
  error?: string;
  quote: CexQuoteLike | null;
}

/**
 * Маппит нативный результат любой CEX-джобы в UnifiedQuoteResult.
 *
 * @param source   — имя биржи ('binance' | 'mexc' | ...)
 * @param result   — нативный результат джобы (BinanceQuotesResult и т.д.)
 * @param token0   — базовый токен (напр. "ETH")
 * @param token1   — котировочный токен (напр. "USDC")
 */
export function cexToUnified(
  source: QuoteSourceName,
  result: CexResultLike,
  token0: string,
  token1: string,
): UnifiedQuoteResult {
  if (!result.ok || !result.quote) {
    return {
      sourceType: 'cex',
      source,
      token0,
      token1,
      ok: false,
      latencyMs: result.latencyMs,
      error: result.error ?? 'No quote data',
      timestamp: Date.now(),
      bidPrice: 0,
      askPrice: 0,
      midPrice: 0,
      spread: 0,
      spreadPct: 0,
    };
  }

  const q = result.quote;

  return {
    sourceType: 'cex',
    source,
    token0,
    token1,
    ok: true,
    latencyMs: result.latencyMs,
    timestamp: Date.now(),
    bidPrice: q.bidPrice,
    askPrice: q.askPrice,
    midPrice: q.midPrice,
    spread: q.spread,
    spreadPct: q.spreadPct,
    bidQty: q.bidQty,
    askQty: q.askQty,
  };
}

