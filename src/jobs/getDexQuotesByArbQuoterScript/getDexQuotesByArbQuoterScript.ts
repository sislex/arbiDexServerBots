import { IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script } from '../../store/state.types';
import { dexToUnified, marketDataClient } from '../shared';
import { getDexQuotesByScript } from './helpers/getDexQuotes';
import { normalizeSource, parseExtraSettings, resolveEnvPrefixBySource, resolveUnifiedDexSource } from './helpers/parse';
import { toAmount } from './helpers/toAmount';
import { DexQuotesByArbQuoterScriptResult } from './helpers/types';
import { validateScriptQuoterParams } from './helpers/validate';

export async function getDexQuotesByArbQuoterScript(
  params: IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script,
  opts?: { humanReadable?: boolean },
): Promise<DexQuotesByArbQuoterScriptResult> {
  const { pairsToQuote, rpcUrl = 'https://arb1.arbitrum.io/rpc' } = params;
  const source = normalizeSource(params.source);
  const unifiedSource = resolveUnifiedDexSource(source);
  const envPrefix = resolveEnvPrefixBySource(source);

  const parsedSettings = parseExtraSettings(params.extraSettings);

  const tokenInAddress = params.opts?.tokenIn?.address ?? params.token0 ?? '';
  const tokenOutAddress = params.opts?.tokenOut?.address ?? params.token1 ?? '';

  const tokenPair = {
    tokenIn: {
      ...params.opts?.tokenIn,
      address: tokenInAddress,
      amount: toAmount(Number(parsedSettings?.amountIn ?? 0), params.opts?.tokenIn?.decimals || 0) ?? 0n,
      decimals: params.opts?.tokenIn?.decimals ?? 18,
      symbol: params.opts?.tokenIn?.symbol ?? '',
    },
    tokenOut: {
      ...params.opts?.tokenOut,
      address: tokenOutAddress,
      amount: toAmount(Number(parsedSettings?.amountOut ?? 0), params.opts?.tokenOut?.decimals || 0) ?? 0n,
      decimals: params.opts?.tokenOut?.decimals ?? 18,
      symbol: params.opts?.tokenOut?.symbol ?? '',
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

  const result = await getDexQuotesByScript({
    pairsToQuote,
    rpcUrl,
    tokenPair,
    humanReadable: opts?.humanReadable ?? true,
    quoterAddress: validation.quoterAddress,
    envPrefix: validation.envPrefix,
  });

  result.unified = dexToUnified(result, tokenInAddress, tokenOutAddress, unifiedSource);
  marketDataClient.writeQuote(result.unified);
  return result;
}

