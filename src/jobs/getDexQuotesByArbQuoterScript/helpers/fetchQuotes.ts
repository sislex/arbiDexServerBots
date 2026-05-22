import { ethers } from 'ethers';
import ArbQuoterAbi from '../../../artifacts/contracts/ArbQuoter.sol/ArbQuoter.json';
import type { IPool } from '../../../store/state.types';
import type { ITokenPair } from './types';
import { configPairToInput } from '../../../scripts/arbQuoter/networks/helpers/configQuoteInput';
import { buildStoreStep } from './buildStoreStep';

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

const IMPACT_SINGLE_FN =
  'quoteExactInWithImpact((uint8,address,address[],address,address,address,uint24,int24,address),uint256,uint256)';

export async function fetchBuySellQuotesByScript(
  pairsToQuote: IPool[],
  rpcUrl: string,
  tokenPair: ITokenPair,
  quoterAddress: string,
  envPrefix: 'ARBITRUM' | 'OPTIMISM' | 'BASE' | 'LINEA' | 'BLAST',
  referenceDivisor?: bigint,
): Promise<FetchBuySellQuotesResult> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const quoter = new ethers.Contract(quoterAddress, ArbQuoterAbi.abi, provider);

  const tokenInAddress = tokenPair.tokenIn.address;
  const tokenOutAddress = tokenPair.tokenOut.address;

  if (!tokenInAddress || !tokenOutAddress) {
    throw new Error('tokenIn.address and tokenOut.address must be defined in tokenPair');
  }

  const inDecimals = tokenPair.tokenIn.decimals ?? 18;
  const outDecimals = tokenPair.tokenOut.decimals ?? 18;
  const amountIn = tokenPair.tokenIn.amount ?? 0n;
  const amountOut = tokenPair.tokenOut.amount ?? 0n;

  const configuredDivisor = referenceDivisor ?? BigInt(process.env.REFERENCE_DIVISOR ?? '100');
  const safeDivisor = configuredDivisor > 0n ? configuredDivisor : 100n;
  const referenceAmountIn = amountIn > 0n ? (amountIn / safeDivisor || 1n) : 0n;
  const hasAmountOut = amountOut > 0n;
  const referenceAmountOut = hasAmountOut ? (amountOut / safeDivisor || 1n) : 0n;

  const pairs = pairsToQuote.map((pool) =>
    configPairToInput({
      dex: pool.dex,
      version: pool.version,
      poolAddress: pool.poolAddress,
      feePpm: pool.feePpm,
    }),
  );

  const quoteInput = {
    tokenIn: ethers.getAddress(tokenInAddress),
    tokenOut: ethers.getAddress(tokenOutAddress),
    tokenInDecimals: inDecimals,
    tokenOutDecimals: outDecimals,
    amountIn,
    referenceAmountIn,
    hasAmountOut,
    amountOut: hasAmountOut ? amountOut : 0n,
    referenceAmountOut,
    pairs,
  };

  try {
    const result = await quoter.quoteConfigExactInWithImpact.staticCall(quoteInput) as {
      quotes: Array<{
        buy: { amountOut: bigint; success: boolean };
        sell: { amountOut: bigint; success: boolean };
        buyAmountOutHumanX18: bigint;
        sellAmountOutHumanX18: bigint;
        success: boolean;
        sellEnabled: boolean;
      }>;
      blockNumber: bigint;
      gasUsed: bigint;
    };

    const quoteRows = result.quotes.map((item, i) => ({
      buy: {
        index: BigInt(i),
        amountOut: item.buyAmountOutHumanX18,
        success: item.buy.success,
      } as QuoteItem,
      sell: {
        index: BigInt(i),
        amountOut: item.sellAmountOutHumanX18,
        amountIn: hasAmountOut ? amountOut : item.buyAmountOutHumanX18,
        success: item.sellEnabled ? item.sell.success : false,
      } as QuoteItem,
    }));

    const blockNumber = result.blockNumber ?? BigInt(await provider.getBlockNumber());
    return {
      buyQuotes: quoteRows.map((x) => x.buy),
      sellQuotes: quoteRows.map((x) => x.sell),
      blockNumber,
      gasUsed: result.gasUsed ?? 0n,
    };
  } catch {
    // Fallback: one bad pool must not fail whole job.
    const referenceAmountInForSingle = amountIn > 0n ? (amountIn / safeDivisor || 1n) : 0n;
    const steps = pairsToQuote.map((pool) =>
      buildStoreStep(pool, tokenInAddress, tokenOutAddress, envPrefix),
    );

    const quoteRows = await Promise.all(
      steps.map(async (step, i) => {
        try {
          const r = await quoter[IMPACT_SINGLE_FN].staticCall(step, amountIn, referenceAmountInForSingle) as {
            amountOut: bigint;
            sellAmountOut: bigint;
            canTradeAmountIn: boolean;
            success: boolean;
          };

          return {
            buy: {
              index: BigInt(i),
              amountOut: r.amountOut,
              success: r.success,
            } as QuoteItem,
            sell: {
              index: BigInt(i),
              amountOut: r.sellAmountOut,
              amountIn: r.amountOut,
              success: r.success && r.canTradeAmountIn,
            } as QuoteItem,
          };
        } catch {
          return {
            buy: { index: BigInt(i), amountOut: 0n, success: false } as QuoteItem,
            sell: { index: BigInt(i), amountOut: 0n, amountIn: 0n, success: false } as QuoteItem,
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
}

