import { ethers } from 'ethers';
import { IPool } from '../../../store/state.types';
import { setup } from '../../getQuoteFromArbExecutor/helpers/setup';
import ArbQuoterAbi from '../../../artifacts/contracts/ArbQuoter.sol/ArbQuoter.json';
import { poolConfigToStoreStep, poolToPoolConfig } from '../../getQuoteFromArbExecutor/helpers/poolConfigToStoreSteps';
import { ITokenPair } from './types';

// ── Типы результата ──────────────────────────────────────────

export interface QuoteItem {
  index: bigint;
  amountOut: bigint;
  success: boolean;
}

export interface FetchBuySellQuotesResult {
  buyQuotes: QuoteItem[];
  sellQuotes: QuoteItem[];
  blockNumber: bigint;
  gasUsed: bigint;
}

// ── Функция ──────────────────────────────────────────────────

/**
 * Шаги 1-3: setup, конвертация IPool[] → SwapSteps, два параллельных
 * вызова quoteExactInBatch (buy + sell).
 *
 * Buy:  tokenIn  → tokenOut  (e.g. USDC → WETH),  amountIn = tokenPair.tokenIn.amount
 * Sell: tokenOut → tokenIn   (e.g. WETH → USDC),  amountIn = tokenPair.tokenOut.amount
 */
export async function fetchBuySellQuotes(
  pairsToQuote: IPool[],
  rpcUrl: string,
  tokenPair: ITokenPair,
  quoterAddress: string,
): Promise<FetchBuySellQuotesResult> {
  // ── 1. Setup ──
  const { provider } = setup(rpcUrl);
  const quoter = new ethers.Contract(quoterAddress, ArbQuoterAbi.abi, provider);

  // ── 2. Конвертируем IPool[] → SwapSteps ──
  const tokenInAddress  = tokenPair.tokenIn.address;
  const tokenOutAddress = tokenPair.tokenOut.address;

  // Buy steps: tokenIn → tokenOut  (USDC → WETH)
  const buySteps = pairsToQuote.map((pool) =>
    poolConfigToStoreStep(poolToPoolConfig(pool, tokenInAddress, tokenOutAddress)),
  );

  // Sell steps: tokenOut → tokenIn  (WETH → USDC) — обратное направление
  const sellSteps = pairsToQuote.map((pool) =>
    poolConfigToStoreStep(poolToPoolConfig(pool, tokenOutAddress, tokenInAddress)),
  );

  const buyAmountIn  = tokenPair.tokenIn.amount;
  const sellAmountIn = tokenPair.tokenOut.amount;

  // ── 3. Два параллельных вызова quoteExactInBatch ──
  const [buyResult, sellResult] = await Promise.all([
    quoter.quoteExactInBatch.staticCall(buySteps, buyAmountIn),
    quoter.quoteExactInBatch.staticCall(sellSteps, sellAmountIn),
  ]);

  return {
    buyQuotes:   buyResult.quotes as QuoteItem[],
    sellQuotes:  sellResult.quotes as QuoteItem[],
    blockNumber: buyResult.blockNumber as bigint,
    gasUsed:     (buyResult.gasUsed + sellResult.gasUsed) as bigint,
  };
}

