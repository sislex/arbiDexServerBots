import {
  stabsConfigToQuoteInput,
  type DeployedImpactQuoteStabsConfig,
  type PoolQuoteMeta,
} from "./configQuoteInput.js";
import {
  buildQuoteRowsFromResult,
  type ConfigImpactQuoteBatchResultStruct,
  type QuoteTableRow,
} from "./buildQuoteRowsFromResult.js";
import { resolveQuoterEther } from "./resolveQuoterEther.js";
import { buildArbSummary } from './buildArbSummary.js';
import type { ArbSummaryCandidate } from './buildArbSummary.js';
import type { ArbSummaryResult } from './types.js';

type RunDeployedImpactQuoteTestEtherOptions = {
  networkEnvPrefix: string;
  config: DeployedImpactQuoteStabsConfig;
  includeRevertHint?: boolean;
  rpcUrl?: string;
};

function parseExtraSettings(extraSettings: unknown): {
  amountIn?: number | number[];
  amountOut?: number;
  referenceDivisor?: number;
} {
  if (!extraSettings) return {};
  if (typeof extraSettings === 'string') {
    try {
      return JSON.parse(extraSettings) as {
        amountIn?: number | number[];
        amountOut?: number;
        referenceDivisor?: number;
      };
    } catch {
      return {};
    }
  }
  if (typeof extraSettings === 'object') {
    return extraSettings as {
      amountIn?: number | number[];
      amountOut?: number;
      referenceDivisor?: number;
    };
  }
  return {};
}

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
  const parsedExtraSettings = parseExtraSettings(config.extraSettings);

  const configAmountIn = parsedExtraSettings.amountIn;
  if (configAmountIn === undefined) {
    throw new Error(`Missing extraSettings.amountIn in ${networkEnvPrefix}`);
  }
  const configReferenceDivisor = parsedExtraSettings.referenceDivisor ?? 100;

  if (!config.pairsToQuote.length) {
    throw new Error(`${networkEnvPrefix}.pairsToQuote is empty`);
  }

  const amountInHuman = parseSingleAmountIn(configAmountIn, networkEnvPrefix);
  const amountOutHuman = parseOptionalAmountOut(parsedExtraSettings.amountOut);
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












