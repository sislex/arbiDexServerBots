import { UnifiedQuoteResult } from '../shared';

/** Общий shape котировки для любой CEX-биржи */
export interface CexQuote {
  symbol: string;
  bidPrice: number;
  bidQty: number;
  askPrice: number;
  askQty: number;
  midPrice: number;
  spread: number;
  spreadPct: number;
  latencyMs: number;
}

/** Общий результат CEX-джобы */
export interface CexQuotesResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  quote: CexQuote | null;
  unified?: UnifiedQuoteResult;
}

