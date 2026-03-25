import { OkxQuote } from './getOkxQuote';

export interface OkxQuotesResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  quote: OkxQuote | null;
}

