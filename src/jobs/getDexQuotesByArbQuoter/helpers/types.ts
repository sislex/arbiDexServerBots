import { UnifiedQuoteResult } from '../../shared';

export interface IDexTokenConfig {
  address: string;
  amount: bigint;
  decimals: number;
  symbol: string;
}

export interface ITokenPair {
  tokenIn: IDexTokenConfig;
  tokenOut: IDexTokenConfig;
}

export interface GetDexQuotesByArbQuoterOpts {
  tokenPair: ITokenPair;
  /**
   * true  → цена в человекочитаемом виде: 1 WETH ≈ 2152 USDC
   * false → цена в smallest units:        1 WETH ≈ 2152000000 USDC (без decimals)
   * По умолчанию true.
   */
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

  /** Нормализованная цена покупки (за 1 единицу) в выбранной валюте */
  buyPrice: number;
  /** Нормализованная цена продажи (за 1 единицу) в выбранной валюте */
  sellPrice: number;

  gasUsed: string;
}

export interface DexQuotesByArbQuoteResult {
  ok: boolean;
  latencyMs: number;
  blockNumber: number;
  error?: string;

  filteredPairsCount: number;

  /** Лучшая цена покупки (за 1 tokenOut в tokenIn, например 2150 USDC за 1 WETH) */
  bestBuyPrice: number;
  /** Лучшая цена продажи (за 1 tokenOut в tokenIn) */
  bestSellPrice: number;

  bestBuy: PoolQuoteResult | null;
  bestSell: PoolQuoteResult | null;

  allQuotes: PoolQuoteResult[];

  /** Унифицированный результат */
  unified?: UnifiedQuoteResult;
}


