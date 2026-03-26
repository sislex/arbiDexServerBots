import { BybitQuote } from './getBybitQuote';
import { UnifiedQuoteResult } from '../../shared';

/**
 * Результат джобы getBybitQuotes.
 */
export interface BybitQuotesResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  quote: BybitQuote | null;
  /** Унифицированный результат */
  unified?: UnifiedQuoteResult;
}

