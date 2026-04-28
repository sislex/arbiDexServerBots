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

const parseExtraSettings = (extraSettings: unknown): Record<string, unknown> => {
  if (!extraSettings) return {};
  if (typeof extraSettings === 'string') {
    try {
      return JSON.parse(extraSettings) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof extraSettings === 'object') {
    return extraSettings as Record<string, unknown>;
  }
  return {};
};

const normalizeSource = (source?: string): string => (source ?? '').trim().toLowerCase();

const isOptimismSource = (source: string): boolean => {
  return source.startsWith('dex:optimism');
};

const resolveUnifiedDexSource = (useOptimism: boolean): 'dex:arbitrum' | 'dex:optimism' => {
  return useOptimism ? 'dex:optimism' : 'dex:arbitrum';
};

const pickOptimismTokenAddress = (symbol?: string): string | undefined => {
  switch ((symbol ?? '').trim().toUpperCase()) {
    case 'USDC':
      return process.env.OPTIMISM_USDC;
    case 'WETH':
      return process.env.OPTIMISM_WETH;
    case 'OP':
      return process.env.OPTIMISM_OP;
    default:
      return undefined;
  }
};

// ── Джоба ────────────────────────────────────────────────────

export async function getDexQuotesByArbQuoter(
  params: IJobParams_get_Dex_Quotes_By_Arb_Quoter,
  opts?: Partial<GetDexQuotesByArbQuoterOpts>,
): Promise<DexQuotesByArbQuoteResult> {
  const { pairsToQuote, rpcUrl = 'https://arb1.arbitrum.io/rpc' } = params;
  const source = normalizeSource(params.source);
  const useOptimism = isOptimismSource(source);
  const unifiedSource = resolveUnifiedDexSource(useOptimism);

  const parsedSettings = parseExtraSettings(params.extraSettings);

  const optimismTokenInFallback = useOptimism
    ? pickOptimismTokenAddress(params.opts?.tokenIn?.symbol)
    : undefined;
  const optimismTokenOutFallback = useOptimism
    ? pickOptimismTokenAddress(params.opts?.tokenOut?.symbol)
    : undefined;

  // Адреса токенов: opts.address -> legacy token0/token1 -> optimism env fallback
  const tokenInAddress = params.opts?.tokenIn?.address ?? params.token0 ?? optimismTokenInFallback ?? '';
  const tokenOutAddress = params.opts?.tokenOut?.address ?? params.token1 ?? optimismTokenOutFallback ?? '';

  const tokenPair = {
    tokenIn: {
      ...params?.opts?.tokenIn,
      address: tokenInAddress,
      amount: toAmount(Number(parsedSettings?.amountIn ?? 0), params?.opts?.tokenIn?.decimals || 0) ?? 0n,
      decimals: params?.opts?.tokenIn?.decimals ?? 18,
      symbol: params?.opts?.tokenIn?.symbol ?? '',
    },
    tokenOut: {
      ...params?.opts?.tokenOut,
      address: tokenOutAddress,
      amount: toAmount(Number(parsedSettings?.amountOut ?? 0), params?.opts?.tokenOut?.decimals || 0) ?? 0n,
      decimals: params?.opts?.tokenOut?.decimals ?? 18,
      symbol: params?.opts?.tokenOut?.symbol ?? '',
    },
  };

  const quoterAddress = useOptimism
    ? process.env.OPTIMISM_QUOTER_ADDRESS
    : process.env.QUOTER_ADDRESS;

  if (useOptimism && !quoterAddress) {
    const error = 'OPTIMISM_QUOTER_ADDRESS не задан в .env для source=dex:optimism';
    const failed: DexQuotesByArbQuoteResult = {
      ok: false,
      latencyMs: 0,
      blockNumber: 0,
      error,
      filteredPairsCount: pairsToQuote?.length ?? 0,
      bestBuyPrice: 0,
      bestSellPrice: 0,
      bestBuy: null,
      bestSell: null,
      allQuotes: [],
    };

    failed.unified = dexToUnified(failed, tokenInAddress, tokenOutAddress, unifiedSource);
    marketDataClient.writeQuote(failed.unified);
    return failed;
  }

  const result = await getDexQuotes({
    pairsToQuote,
    rpcUrl,
    tokenPair,
    humanReadable: opts?.humanReadable ?? true,
    quoterAddress,
  });

  result.unified = dexToUnified(result, tokenInAddress, tokenOutAddress, unifiedSource);
  marketDataClient.writeQuote(result.unified);

  return result;
}
