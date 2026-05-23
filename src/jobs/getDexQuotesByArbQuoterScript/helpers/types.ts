import type { UnifiedQuoteResult } from '../../shared';

export interface ArbSummaryBestBuyRow {
  amount: string;
  bestBuyPriceOutPerIn: string;
  dex: string;
  version: string;
  pool: string;
}

export interface ArbSummaryBestSellRow {
  amount: string;
  bestSellPriceOutPerIn: string;
  dex: string;
  version: string;
  pool: string;
}

export interface ArbSummaryResult {
  bestBuyRows: ArbSummaryBestBuyRow[];
  bestSellRows: ArbSummaryBestSellRow[];
  arbLines: string[];
}

export interface DexQuotesByArbQuoterScriptResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  result?: ArbSummaryResult;
  unified?: UnifiedQuoteResult;
}

