import { MexcQuote } from './getMexcQuote';

/**
 * Результат джобы getMexcQuotes.
 */
export interface MexcQuotesResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  quote: MexcQuote | null;
}

