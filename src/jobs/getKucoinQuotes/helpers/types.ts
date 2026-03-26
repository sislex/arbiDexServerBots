import { KucoinQuote } from './getKucoinQuote';
import { UnifiedQuoteResult } from '../../shared';

export interface KucoinQuotesResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  quote: KucoinQuote | null;
  /** Унифицированный результат */
  unified?: UnifiedQuoteResult;
}

