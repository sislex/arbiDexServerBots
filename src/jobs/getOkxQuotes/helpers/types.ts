import { OkxQuote } from './getOkxQuote';
import { UnifiedQuoteResult } from '../../shared';

export interface OkxQuotesResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  quote: OkxQuote | null;
  /** Унифицированный результат */
  unified?: UnifiedQuoteResult;
}

