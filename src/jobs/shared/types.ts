/**
 * Единые типы для результатов всех джоб получения котировок.
 *
 * Семантика цен:
 *   bidPrice — лучшая цена, по которой можно ПРОДАТЬ базовый актив (tokenOut / base)
 *   askPrice — лучшая цена, по которой можно КУПИТЬ базовый актив (tokenOut / base)
 *
 *   Для CEX:  bidPrice = order-book bid,  askPrice = order-book ask
 *   Для DEX:  bidPrice = bestSellPrice,   askPrice = bestBuyPrice
 *
 * Цены всегда выражены в quote-валюте (USDC/USDT) за 1 единицу base (WETH).
 */

export type QuoteSourceType = 'cex' | 'dex';

export type QuoteSourceName =
  | 'binance'
  | 'mexc'
  | 'bybit'
  | 'okx'
  | 'kucoin'
  | 'gateio'
  | 'dzengi'
  | 'dex:arbitrum'
  | 'dex:base'
  | 'dex:blast'
  | 'dex:linea'
  | 'dex:optimism';

export interface UnifiedQuoteResult {
  /** Тип источника */
  sourceType?: QuoteSourceType;

  /** Имя источника */
  source: QuoteSourceName;

  /** Базовый токен (CEX: тикер, напр. "ETH"; DEX: адрес 0x…) */
  token0: string;

  /** Котировочный токен (CEX: тикер, напр. "USDC"; DEX: адрес 0x…) */
  token1: string;

  /** Запрос завершился успешно */
  ok: boolean;

  /** Время получения котировки (мс) */
  latencyMs: number;

  /** Сообщение об ошибке (если ok = false) */
  error?: string;

  /** Unix-timestamp момента получения котировки (Date.now()) */
  timestamp: number;

  // ── Цены ──────────────────────────────────────────

  /** Лучшая цена покупателя (bid) — по ней можно ПРОДАТЬ base-актив */
  bidPrice: number;

  /** Лучшая цена продавца (ask) — по ней можно КУПИТЬ base-актив */
  askPrice: number;

  /** Средняя цена: (bid + ask) / 2 */
  midPrice: number;

  /** Абсолютный спред: ask − bid */
  spread: number;

  /** Спред в %: spread / midPrice × 100 */
  spreadPct: number;

  // ── Опциональные поля (CEX) ───────────────────────

  /** Объём на лучшем bid (CEX) */
  bidQty?: number;

  /** Объём на лучшем ask (CEX) */
  askQty?: number;

  // ── Опциональные поля (DEX) ───────────────────────

  /** Номер блока (только DEX) */
  blockNumber?: number;

  /** Gas, потраченный на quoter-вызов (только DEX) */
  gasUsed?: string;

  /** Количество пулов в запросе (только DEX) */
  poolsCount?: number;

  /** Детали лучшего пула на покупку (только DEX) */
  bestBuyPool?: PoolBrief | null;

  /** Детали лучшего пула на продажу (только DEX) */
  bestSellPool?: PoolBrief | null;
}

/**
 * Краткая информация о пуле (для DEX-источника).
 */
export interface PoolBrief {
  dex: string;
  version: string;
  poolAddress: string;
  feePpm?: number;
}

