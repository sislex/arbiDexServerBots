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
  amountIn?: bigint;
}

export interface FetchBuySellQuotesResult {
  buyQuotes: QuoteItem[];
  sellQuotes: QuoteItem[];
  blockNumber: bigint;
  gasUsed: bigint;
}

// ── Функция ──────────────────────────────────────────────────

/**
 * Новый поток через ArbQuoter.quoteExactInWithImpact:
 * для каждого пула получаем amountOut (buy) и sellAmountOut (sell/roundtrip).
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

  if (!tokenInAddress || !tokenOutAddress) {
    throw new Error('tokenIn.address and tokenOut.address must be defined in tokenPair');
  }

  // Buy steps: tokenIn → tokenOut
  const buySteps = pairsToQuote.map((pool) =>
    poolConfigToStoreStep(poolToPoolConfig(pool, tokenInAddress, tokenOutAddress)),
  );

  const buyAmountIn = tokenPair.tokenIn.amount ?? 0n;
  const referenceDivisor = BigInt(process.env.REFERENCE_DIVISOR ?? '100');
  const safeDivisor = referenceDivisor > 0n ? referenceDivisor : 100n;
  const referenceAmountIn = buyAmountIn / safeDivisor || 1n;
  const IMPACT_FN =
    'quoteExactInWithImpact((uint8,address,address[],address,address,address,uint24,int24,address),uint256,uint256)';

  const quoteRows = await Promise.all(
    buySteps.map(async (step, i) => {
      try {
        const r = await quoter[IMPACT_FN].staticCall(step, buyAmountIn, referenceAmountIn) as {
          amountOut: bigint;
          sellAmountOut: bigint;
          canTradeAmountIn: boolean;
          success: boolean;
        };

        console.log('r', r);

        return {
          buy: {
            index: BigInt(i),
            amountOut: r.amountOut,
            success: r.success,
          } as QuoteItem,
          sell: {
            index: BigInt(i),
            amountOut: r.sellAmountOut,
            // Для расчёта sellPrice используем фактический объём tokenOut из buy-части.
            amountIn: r.amountOut,
            success: r.success && r.canTradeAmountIn,
          } as QuoteItem,
        };
      } catch {
        return {
          buy: {
            index: BigInt(i),
            amountOut: 0n,
            success: false,
          } as QuoteItem,
          sell: {
            index: BigInt(i),
            amountOut: 0n,
            amountIn: 0n,
            success: false,
          } as QuoteItem,
        };
      }
    }),
  );

  const blockNumber = BigInt(await provider.getBlockNumber());

  return {
    buyQuotes: quoteRows.map((x) => x.buy),
    sellQuotes: quoteRows.map((x) => x.sell),
    blockNumber,
    gasUsed: 0n,
  };
}

