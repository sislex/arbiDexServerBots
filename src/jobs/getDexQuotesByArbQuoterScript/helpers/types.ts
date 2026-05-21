import { UnifiedQuoteResult } from '../../shared';

export interface IDexTokenConfig {
  address?: string;
  amount?: bigint;
  decimals: number;
  symbol: string;
}

export interface ITokenPair {
  tokenIn: IDexTokenConfig;
  tokenOut: IDexTokenConfig;
}

export interface GetDexQuotesByArbQuoterScriptOpts {
  humanReadable?: boolean;
}

export interface PoolQuoteResult {
  poolIndex: number;
  dex: string;
  version: string;
  poolAddress: string;
  feePpm: number | undefined;
  buyAmountOut: string;
  buyAmountOutFormatted: string;
  buySuccess: boolean;
  sellAmountOut: string;
  sellAmountOutFormatted: string;
  sellSuccess: boolean;
  buyPrice: number;
  sellPrice: number;
  gasUsed: string;
}

export interface DexQuotesByArbQuoterScriptResult {
  ok: boolean;
  latencyMs: number;
  blockNumber: number;
  error?: string;
  filteredPairsCount: number;
  bestBuyPrice: number;
  bestSellPrice: number;
  bestBuy: PoolQuoteResult | null;
  bestSell: PoolQuoteResult | null;
  allQuotes: PoolQuoteResult[];
  unified?: UnifiedQuoteResult;
}
