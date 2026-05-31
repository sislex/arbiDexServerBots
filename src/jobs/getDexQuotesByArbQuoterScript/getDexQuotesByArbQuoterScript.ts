import type { IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script } from '../../store/state.types';
import type { DexQuotesByArbQuoterScriptResult } from './helpers/types';
import {runDeployedImpactQuoteTestEther} from './helpers/runDeployedImpactQuoteTestEther.js';
import type {DeployedImpactQuoteStabsConfig} from './helpers/configQuoteInput';
import { arbSummaryToUnified } from './helpers/arbSummaryToUnified.js';
import { getNetworkEnvPrefix } from './helpers/getNetworkEnvPrefix.js';
import type { UnifiedQuoteResult } from '../shared/types';
import { marketDataClient } from '../shared/index.js';

export async function getDexQuotesByArbQuoterScript(
  params: IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script,
  opts?: { humanReadable?: boolean },
): Promise<DexQuotesByArbQuoterScriptResult> {
  const startedAt = Date.now();

  try {
    const networkEnvPrefix = getNetworkEnvPrefix(params.source);
    const result = await runDeployedImpactQuoteTestEther({
      networkEnvPrefix,
      config: params as DeployedImpactQuoteStabsConfig,
    });

    const unified = arbSummaryToUnified({
      summary: result,
      source: params.source as UnifiedQuoteResult['source'],
      token0: params.opts?.tokenIn?.address ?? '',
      token1: params.opts?.tokenOut?.address ?? '',
      latencyMs: Date.now() - startedAt,
    });

    // console.log('unified', unified);

    marketDataClient.writeQuote(unified);

    return {
      ok: unified.ok,
      latencyMs: unified.latencyMs,
      error: unified.error,
      result,
      unified,
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    process.exitCode = 1;
    const unified: UnifiedQuoteResult = {
      sourceType: 'dex',
      source: params.source as UnifiedQuoteResult['source'],
      token0: params.opts?.tokenIn?.address ?? '',
      token1: params.opts?.tokenOut?.address ?? '',
      ok: false,
      latencyMs: Date.now() - startedAt,
      error,
      timestamp: Date.now(),
      bidPrice: 0,
      askPrice: 0,
      midPrice: 0,
      spread: 0,
      spreadPct: 0,
    };

    marketDataClient.writeQuote(unified);

    return {
      ok: false,
      latencyMs: unified.latencyMs,
      error,
      unified,
    };
  }
}

