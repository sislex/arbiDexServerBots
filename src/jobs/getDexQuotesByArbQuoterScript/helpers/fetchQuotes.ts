import { ethers } from 'ethers';
import ArbQuoterAbi from '../../../artifacts/contracts/ArbQuoter.sol/ArbQuoter.json';
import { IPool } from '../../../store/state.types';
import { buildStoreStep } from './buildStoreStep';
import { ITokenPair } from './types';

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

const IMPACT_FN =
  'quoteExactInWithImpact((uint8,address,address[],address,address,address,uint24,int24,address),uint256,uint256)';

export async function fetchBuySellQuotesByScript(
  pairsToQuote: IPool[],
  rpcUrl: string,
  tokenPair: ITokenPair,
  quoterAddress: string,
  envPrefix: 'ARBITRUM' | 'OPTIMISM' | 'BASE' | 'LINEA' | 'BLAST',
): Promise<FetchBuySellQuotesResult> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const quoter = new ethers.Contract(quoterAddress, ArbQuoterAbi.abi, provider);

  const tokenInAddress = tokenPair.tokenIn.address;
  const tokenOutAddress = tokenPair.tokenOut.address;

  if (!tokenInAddress || !tokenOutAddress) {
    throw new Error('tokenIn.address and tokenOut.address must be defined in tokenPair');
  }

  const steps = pairsToQuote.map((pool) =>
    buildStoreStep(pool, tokenInAddress, tokenOutAddress, envPrefix),
  );

  const buyAmountIn = tokenPair.tokenIn.amount ?? 0n;
  const referenceDivisor = BigInt(process.env.REFERENCE_DIVISOR ?? '100');
  const safeDivisor = referenceDivisor > 0n ? referenceDivisor : 100n;
  const referenceAmountIn = buyAmountIn / safeDivisor || 1n;

  const quoteRows = await Promise.all(
    steps.map(async (step, i) => {
      try {
        const r = await quoter[IMPACT_FN].staticCall(step, buyAmountIn, referenceAmountIn) as {
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

