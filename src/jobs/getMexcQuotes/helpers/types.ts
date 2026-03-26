import { MexcQuote } from './getMexcQuote';
import { UnifiedQuoteResult } from '../../shared';

/**
 * Результат джобы getMexcQuotes.
 */
export interface MexcQuotesResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  quote: MexcQuote | null;
  /** Унифицированный результат */
  unified?: UnifiedQuoteResult;
}

