import { KucoinQuote } from './getKucoinQuote';

export interface KucoinQuotesResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  quote: KucoinQuote | null;
}

