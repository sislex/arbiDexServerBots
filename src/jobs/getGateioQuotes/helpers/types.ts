import { GateioQuote } from './getGateioQuote';
import { UnifiedQuoteResult } from '../../shared';

export interface GateioQuotesResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  quote: GateioQuote | null;
  /** Унифицированный результат */
  unified?: UnifiedQuoteResult;
}

