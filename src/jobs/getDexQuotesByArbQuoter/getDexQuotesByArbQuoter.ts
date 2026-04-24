import { IJobParams_get_Dex_Quotes_By_Arb_Quoter } from '../../store/state.types';
import { USDC, WETH } from '../../store/stabs/tokens.stabs';
import { toAmount } from './helpers/toAmount';
import { getDexQuotes } from './helpers/getDexQuotes';
import type {
  GetDexQuotesByArbQuoterOpts,
  DexQuotesByArbQuoteResult,
} from './helpers/types';
import { dexToUnified, marketDataClient } from '../shared';

// Реэкспорт
export type {
  IDexTokenConfig,
  ITokenPair,
  GetDexQuotesByArbQuoterOpts,
  PoolQuoteResult,
  DexQuotesByArbQuoteResult,
} from './helpers/types';
export { toAmount } from './helpers/toAmount';
export { getDexQuotes } from './helpers/getDexQuotes';

export const TOKEN_PAIR = {
  tokenIn: {
    address: USDC.address,
    amount: toAmount(100, USDC.decimals),
    decimals: USDC.decimals,
    symbol: 'USDC',
  },
  tokenOut: {
    address: WETH.address,
    amount: toAmount(0.03, WETH.decimals),
    decimals: WETH.decimals,
    symbol: 'WETH',
  },
} as const;

// ── Джоба ────────────────────────────────────────────────────

export async function getDexQuotesByArbQuoter(
  params: IJobParams_get_Dex_Quotes_By_Arb_Quoter,
  opts?: Partial<GetDexQuotesByArbQuoterOpts>,
): Promise<DexQuotesByArbQuoteResult> {
  const { pairsToQuote, rpcUrl = 'https://arb1.arbitrum.io/rpc' } = params;

  const tokenPair = {
    tokenIn: {
      ...params?.opts?.tokenIn,
      address: (params as any).token0,
      amount: params?.externalSettings?.amountIn ?? 0n,
      decimals: params?.opts?.tokenIn?.decimals ?? 18,
      symbol: params?.opts?.tokenIn?.symbol ?? '',
    },
    tokenOut: {
      ...params?.opts?.tokenOut,
      address: (params as any).token1,
      amount: params?.externalSettings?.amountOut ?? 0n,
      decimals: params?.opts?.tokenOut?.decimals ?? 18,
      symbol: params?.opts?.tokenOut?.symbol ?? '',
    },
  };

  console.log('::::params', params);
  console.log('::::tokenPair', tokenPair);
  const result = await getDexQuotes({
    pairsToQuote,
    rpcUrl,
    tokenPair,
    humanReadable: opts?.humanReadable ?? true,
    quoterAddress: process.env.QUOTER_ADDRESS,
  });

  result.unified = dexToUnified(result, params.token0, params.token1);
  marketDataClient.writeQuote(result.unified);

  // printQuotesTable(dexQuotes, { tokenPair, humanReadable: true });
  // printUnifiedQuotesTable(result.unified);
  return result;
}
