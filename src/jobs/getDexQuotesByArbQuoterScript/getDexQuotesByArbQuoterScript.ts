import type { IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script } from '../../store/state.types';
import type { DexQuotesByArbQuoterScriptResult } from './helpers/types';
import { runDeployedImpactQuoteTestEther } from './helpers/runDeployedImpactQuoteTestEther.js';
import type { DeployedImpactQuoteStabsConfig } from './helpers/configQuoteInput';
import { arbSummaryToUnified } from './helpers/arbSummaryToUnified.js';
import { getNetworkEnvPrefix } from './helpers/getNetworkEnvPrefix.js';
import type { UnifiedQuoteResult } from '../shared/types';
import { marketDataClient } from '../shared/index.js';
import { quoteBroadcaster } from '../../quotes-stream/quote-broadcaster.service';

function formatDiagnosticNumber(value: number, precision = 12): string {
  if (!Number.isFinite(value)) return 'n/a';
  if (value === 0) return '0';
  return value.toPrecision(precision);
}

function formatDiff(value: number): string {
  if (!Number.isFinite(value)) return 'n/a';
  if (Math.abs(value) < 1e-12) return '0';
  return value.toExponential(6);
}

function printUnifiedQuoteDiagnostics(
  result: DexQuotesByArbQuoterScriptResult['result'],
  unified: UnifiedQuoteResult,
) {
  const amountKey =
    result?.bestBuyRows[0]?.amount ?? result?.bestSellRows[0]?.amount;
  const bestBuyRow =
    result?.bestBuyRows.find((row) => row.amount === amountKey) ??
    result?.bestBuyRows[0];
  const bestSellRow =
    result?.bestSellRows.find((row) => row.amount === amountKey) ??
    result?.bestSellRows[0];
  const contractSellPriceOutPerIn = Number(bestBuyRow?.bestBuyPriceOutPerIn);
  const contractBuyPriceOutPerIn = Number(bestSellRow?.bestSellPriceOutPerIn);
  const backFromBid = unified.bidPrice > 0 ? 1 / unified.bidPrice : NaN;
  const backFromAsk = unified.askPrice > 0 ? 1 / unified.askPrice : NaN;

  console.log('[ArbQuoterScript] unified quote diagnostics');
  console.table([
    {
      side: 'SELL base / bid',
      contractPriceOutPerIn: formatDiagnosticNumber(contractSellPriceOutPerIn),
      unifiedPriceInPerOut: formatDiagnosticNumber(unified.bidPrice),
      backCalculatedOutPerIn: formatDiagnosticNumber(backFromBid),
      diff: formatDiff(backFromBid - contractSellPriceOutPerIn),
      pool: bestBuyRow?.pool ?? 'n/a',
    },
    {
      side: 'BUY base / ask',
      contractPriceOutPerIn: formatDiagnosticNumber(contractBuyPriceOutPerIn),
      unifiedPriceInPerOut: formatDiagnosticNumber(unified.askPrice),
      backCalculatedOutPerIn: formatDiagnosticNumber(backFromAsk),
      diff: formatDiff(backFromAsk - contractBuyPriceOutPerIn),
      pool: bestSellRow?.pool ?? 'n/a',
    },
  ]);
  console.log('[ArbQuoterScript] unified', unified);
}

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

    printUnifiedQuoteDiagnostics(result, unified);

    marketDataClient.writeQuote(unified);
    quoteBroadcaster.publishQuote(unified);

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
    quoteBroadcaster.publishQuote(unified);

    return {
      ok: false,
      latencyMs: unified.latencyMs,
      error,
      unified,
    };
  }
}
