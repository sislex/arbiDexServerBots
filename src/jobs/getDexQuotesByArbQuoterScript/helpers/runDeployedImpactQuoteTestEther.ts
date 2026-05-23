import {
  stabsConfigToQuoteInput,
  type DeployedImpactQuoteStabsConfig,
  type PoolQuoteMeta,
} from "./configQuoteInput.ts";
import {
  buildQuoteRowsFromResult,
  type ConfigImpactQuoteBatchResultStruct,
  type QuoteTableRow,
} from "./buildQuoteRowsFromResult.ts";
import { resolveQuoterEther } from "./resolveQuoterEther.ts";
import { buildArbSummary } from './buildArbSummary.ts';
import type { ArbSummaryCandidate } from './buildArbSummary.ts';
import type { ArbSummaryResult } from './types.ts';

type RunDeployedImpactQuoteTestEtherOptions = {
  networkEnvPrefix: string;
  config: DeployedImpactQuoteStabsConfig;
  includeRevertHint?: boolean;
  rpcUrl?: string;
};

function parseSingleAmountIn(configAmountIn: number | number[], configName: string): string {
  if (Array.isArray(configAmountIn)) {
    throw new Error(`extraSettings.amountIn must be a single number in ${configName}`);
  }

  const amount = String(configAmountIn).trim();
  if (!amount) {
    throw new Error(`Missing extraSettings.amountIn in ${configName}`);
  }

  return amount;
}

function parseOptionalAmountOut(configAmountOut: number | undefined): string | undefined {
  if (configAmountOut === undefined || configAmountOut <= 0) return undefined;
  return String(configAmountOut);
}

function baseFailureRow(
  meta: PoolQuoteMeta,
  inSymbol: string,
  outSymbol: string,
  includeRevertHint: boolean,
  revertHint: string,
) {
  const row: Record<string, string | boolean | number> = {
    dex: meta.dex,
    version: meta.version,
    pool: meta.poolAddress,
    kind: "n/a",
    buyAmountOut: `0 ${outSymbol}`,
    buyPriceOutPerIn: "0",
    buyImpactPpm: "0",
    buyImpactLevel: "REVERT",
    sellEnabled: false,
    sellAmountOut: `0 ${inSymbol}`,
    sellPriceOutPerIn: "n/a",
    sellImpactPpm: "0",
    sellImpactLevel: "n/a",
    success: false,
  };

  if (includeRevertHint) {
    row.revertHint = revertHint;
  }

  return row;
}

export async function runDeployedImpactQuoteTestEther(options: RunDeployedImpactQuoteTestEtherOptions): Promise<ArbSummaryResult> {
  const {
    networkEnvPrefix,
    config,
    includeRevertHint = true,
  } = options;

  const rpcUrl = config.rpcUrl;
  const quoterEnvKey = `${networkEnvPrefix}_QUOTER_ADDRESS`;
  const inSymbol = config.opts?.tokenIn?.symbol ?? "tokenIn";
  const outSymbol = config.opts?.tokenOut?.symbol ?? "tokenOut";

  const configAmountIn = config.extraSettings?.amountIn;
  if (configAmountIn === undefined) {
    throw new Error(`Missing extraSettings.amountIn in ${networkEnvPrefix}`);
  }
  const configReferenceDivisor = config.extraSettings?.referenceDivisor ?? 100;

  if (!config.pairsToQuote.length) {
    throw new Error(`${networkEnvPrefix}.pairsToQuote is empty`);
  }

  const amountInHuman = parseSingleAmountIn(configAmountIn, networkEnvPrefix);
  const amountOutHuman = parseOptionalAmountOut(config.extraSettings?.amountOut);
  const referenceDivisor = BigInt(configReferenceDivisor);
  if (referenceDivisor <= 0n) {
    throw new Error(`extraSettings.referenceDivisor must be > 0 in ${networkEnvPrefix}`);
  }

  const { quoter} = await resolveQuoterEther({
    quoterEnvKey,
    networkEnvPrefix,
    rpcUrl,
  });

  const table: QuoteTableRow[] = [];

  const { quoteInput, poolMetas } = stabsConfigToQuoteInput(config, {
    amountInHuman,
    amountOutHuman,
    referenceDivisor,
  });

  try {
    const result = await (quoter as any)
      .quoteConfigExactInWithImpact
      .staticCall(quoteInput) as ConfigImpactQuoteBatchResultStruct;

    const built = buildQuoteRowsFromResult({
      result,
      poolMetas,
      amountInHuman,
      amountOutHuman,
      inSymbol,
      outSymbol,
      includeRevertHint,
    });

    const arbSummaryCandidates: ArbSummaryCandidate[] = [];
    arbSummaryCandidates.push(...built.arbSummaryCandidates);
    const arbSummary = buildArbSummary(arbSummaryCandidates);

    return arbSummary;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    for (const meta of poolMetas) {
      table.push(baseFailureRow(meta, inSymbol, outSymbol, includeRevertHint, msg.slice(0, 160)));
    }

    return {
      bestBuyRows: [],
      bestSellRows: [],
      arbLines: [msg],
    };
  }
}












