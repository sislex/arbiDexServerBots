import { BinanceQuote } from './getBinanceQuote';

/**
 * Опции для отображения Binance-котировок.
 */
export interface PrintBinanceQuotesOpts {
  /** Символ пары, например 'ETHUSDC' */
  symbol?: string;
}

/**
 * Результат джобы getBinanceQuotes.
 */
export interface BinanceQuotesResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  quote: BinanceQuote | null;
}


