import { IJobParams_get_Dex_Quotes_By_Arb_Quoter } from '../../store/state.types';
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

// ── Джоба ────────────────────────────────────────────────────

export async function getDexQuotesByArbQuoter(
  params: IJobParams_get_Dex_Quotes_By_Arb_Quoter,
  opts?: Partial<GetDexQuotesByArbQuoterOpts>,
): Promise<DexQuotesByArbQuoteResult> {
  const { pairsToQuote, rpcUrl = 'https://arb1.arbitrum.io/rpc' } = params;

  const parsedSettings = params.extraSettings ? JSON.parse(params.extraSettings) : {};

  // Адрес: сначала из opts.tokenIn.address, затем из устаревшего token0
  const tokenInAddress  = params.opts?.tokenIn?.address  ?? params.token0 ?? '';
  const tokenOutAddress = params.opts?.tokenOut?.address ?? params.token1 ?? '';

  const tokenPair = {
    tokenIn: {
      ...params?.opts?.tokenIn,
      address:  tokenInAddress,
      amount:   toAmount(parsedSettings?.amountIn  || 0, params?.opts?.tokenIn?.decimals  || 0) ?? 0n,
      decimals: params?.opts?.tokenIn?.decimals  ?? 18,
      symbol:   params?.opts?.tokenIn?.symbol    ?? '',
    },
    tokenOut: {
      ...params?.opts?.tokenOut,
      address:  tokenOutAddress,
      amount:   toAmount(parsedSettings?.amountOut || 0, params?.opts?.tokenOut?.decimals || 0) ?? 0n,
      decimals: params?.opts?.tokenOut?.decimals ?? 18,
      symbol:   params?.opts?.tokenOut?.symbol   ?? '',
    },
  };

  const result = await getDexQuotes({
    pairsToQuote,
    rpcUrl,
    tokenPair,
    humanReadable: opts?.humanReadable ?? true,
    quoterAddress: process.env.QUOTER_ADDRESS,
  });

  result.unified = dexToUnified(result, tokenInAddress, tokenOutAddress);
  marketDataClient.writeQuote(result.unified);

  return result;
}
