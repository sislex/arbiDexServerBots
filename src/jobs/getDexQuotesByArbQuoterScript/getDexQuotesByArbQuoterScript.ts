import type { IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script } from '../../store/state.types';
import type { DexQuotesByArbQuoterScriptResult } from './helpers/types';
import {runDeployedImpactQuoteTestEther} from './helpers/runDeployedImpactQuoteTestEther.ts';
import type {DeployedImpactQuoteStabsConfig} from './helpers/configQuoteInput.ts';
import { arbSummaryToUnified } from './helpers/arbSummaryToUnified.ts';
import type { UnifiedQuoteResult } from '../shared/types.ts';
import { marketDataClient } from '../shared/market-data-client.ts';

export async function getDexQuotesByArbQuoterScript(
  params: IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script,
  opts?: { humanReadable?: boolean },
): Promise<DexQuotesByArbQuoterScriptResult> {
  const startedAt = Date.now();

  try {
    const result = await runDeployedImpactQuoteTestEther({
      networkEnvPrefix: "ARBITRUM",
      config: params as DeployedImpactQuoteStabsConfig,
    });

    const unified = arbSummaryToUnified({
      summary: result,
      source: params.source as UnifiedQuoteResult['source'],
      token0: params.opts?.tokenIn?.address ?? '',
      token1: params.opts?.tokenOut?.address ?? '',
      latencyMs: Date.now() - startedAt,
    });

    console.log('unified', unified);

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

    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      error,
    };
  }
}

