import { BybitQuote } from './getBybitQuote';

/**
 * Результат джобы getBybitQuotes.
 */
export interface BybitQuotesResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  quote: BybitQuote | null;
}

