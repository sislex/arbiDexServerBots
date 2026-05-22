import type { IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script, IPool } from '../../store/state.types';
import { dexToUnified, marketDataClient } from '../shared';
import { getDexQuotesByScript } from './helpers/getDexQuotes';
import { normalizeSource, parseExtraSettings, resolveEnvPrefixBySource, resolveUnifiedDexSource } from './helpers/parse';
import { getScriptNetworkConfig } from './helpers/networkConfig';
import { toAmount } from './helpers/toAmount';
import type { DexQuotesByArbQuoterScriptResult } from './helpers/types';
import { validateScriptQuoterParams } from './helpers/validate';

const pickFirstNonEmpty = (...values: Array<string | undefined>): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return '';
};

export async function getDexQuotesByArbQuoterScript(
  params: IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script,
  opts?: { humanReadable?: boolean },
): Promise<DexQuotesByArbQuoterScriptResult> {
  const networkConfig = getScriptNetworkConfig(normalizeSource(params.source));
  const fallbackPairs = (networkConfig?.pairsToQuote ?? []) as IPool[];
  const pairsToQuote = params.pairsToQuote?.length ? params.pairsToQuote : fallbackPairs;
  const firstPair = pairsToQuote[0];
  const rpcUrl = params.rpcUrl || networkConfig?.rpcUrl || 'https://arb1.arbitrum.io/rpc';
  const source = normalizeSource(params.source);
  const unifiedSource = resolveUnifiedDexSource(source);
  const envPrefix = resolveEnvPrefixBySource(source);

  const parsedSettings = parseExtraSettings(params.extraSettings ?? networkConfig?.extraSettings);
  const referenceDivisor = BigInt(Number(parsedSettings?.referenceDivisor ?? process.env.REFERENCE_DIVISOR ?? 100));

  const tokenInAddress = pickFirstNonEmpty(
    params.opts?.tokenIn?.address,
    params.token0,
    networkConfig?.opts?.tokenIn?.address,
    networkConfig?.token0,
    firstPair?.token0,
  );
  const tokenOutAddress = pickFirstNonEmpty(
    params.opts?.tokenOut?.address,
    params.token1,
    networkConfig?.opts?.tokenOut?.address,
    networkConfig?.token1,
    firstPair?.token1,
  );

  const tokenInDecimals = params.opts?.tokenIn?.decimals ?? networkConfig?.opts?.tokenIn?.decimals ?? 18;
  const tokenOutDecimals = params.opts?.tokenOut?.decimals ?? networkConfig?.opts?.tokenOut?.decimals ?? 18;

  const tokenPair = {
    tokenIn: {
      ...networkConfig?.opts?.tokenIn,
      ...params.opts?.tokenIn,
      address: tokenInAddress,
      amount: toAmount(Number(parsedSettings?.amountIn ?? 0), tokenInDecimals) ?? 0n,
      decimals: tokenInDecimals,
      symbol: params.opts?.tokenIn?.symbol ?? networkConfig?.opts?.tokenIn?.symbol ?? '',
    },
    tokenOut: {
      ...networkConfig?.opts?.tokenOut,
      ...params.opts?.tokenOut,
      address: tokenOutAddress,
      amount: toAmount(Number(parsedSettings?.amountOut ?? 0), tokenOutDecimals) ?? 0n,
      decimals: tokenOutDecimals,
      symbol: params.opts?.tokenOut?.symbol ?? networkConfig?.opts?.tokenOut?.symbol ?? '',
    },
  };

  const quoterEnvKey = envPrefix ? `${envPrefix}_QUOTER_ADDRESS` : 'QUOTER_ADDRESS';
  const quoterAddress = process.env[quoterEnvKey] ?? process.env.QUOTER_ADDRESS;
  const validation = validateScriptQuoterParams(pairsToQuote, quoterAddress, envPrefix);

  if (!validation.ok) {
    const failed: DexQuotesByArbQuoterScriptResult = {
      ok: false,
      latencyMs: 0,
      blockNumber: 0,
      error: validation.error,
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

  if (!tokenInAddress || !tokenOutAddress) {
    const failed: DexQuotesByArbQuoterScriptResult = {
      ok: false,
      latencyMs: 0,
      blockNumber: 0,
      error: `token addresses unresolved (source=${source}, pairs=${pairsToQuote.length})`,
      filteredPairsCount: pairsToQuote?.length ?? 0,
      bestBuyPrice: 0,
      bestSellPrice: 0,
      bestBuy: null,
      bestSell: null,
      allQuotes: [],
    };
    failed.unified = dexToUnified(failed, tokenInAddress || 'unknown', tokenOutAddress || 'unknown', unifiedSource);
    marketDataClient.writeQuote(failed.unified);
    return failed;
  }

  const result = await getDexQuotesByScript({
    pairsToQuote,
    rpcUrl,
    tokenPair,
    humanReadable: opts?.humanReadable ?? true,
    quoterAddress: validation.quoterAddress,
    envPrefix: validation.envPrefix,
    referenceDivisor,
  });

  result.unified = dexToUnified(result, tokenInAddress, tokenOutAddress, unifiedSource);
  marketDataClient.writeQuote(result.unified);
  return result;
}

