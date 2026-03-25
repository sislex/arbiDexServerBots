import { GateioQuote } from './getGateioQuote';

export interface GateioQuotesResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  quote: GateioQuote | null;
}

