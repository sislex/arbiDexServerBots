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

  // console.log(
  //   `[ArbQuoterScript] start network=${networkEnvPrefix} rpc=${rpcUrl} pools=${config.pairsToQuote.length} amountIn=${amountInHuman} ${inSymbol} amountOut=${amountOutHuman ?? "disabled"} ${outSymbol} refDiv=${referenceDivisor.toString()}`,
  // );

  const table: QuoteTableRow[] = [];

  const { quoteInput, poolMetas } = stabsConfigToQuoteInput(config, {
    amountInHuman,
    amountOutHuman,
    referenceDivisor,
  });

  const callBatchQuote = async (pairsOverride?: typeof quoteInput.pairs) => {
    const input = pairsOverride ? { ...quoteInput, pairs: pairsOverride } : quoteInput;
    return await (quoter as any)
      .quoteConfigExactInWithImpact
      .staticCall(input) as ConfigImpactQuoteBatchResultStruct;
  };

  try {
    const result = await callBatchQuote();
    // console.log(
    //   `[ArbQuoterScript] batch success block=${result.blockNumber.toString()} gas=${result.gasUsed.toString()} quotes=${result.quotes.length}`,
    // );

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
    // console.log(
    //   `[ArbQuoterScript] summary rows buy=${arbSummary.bestBuyRows.length} sell=${arbSummary.bestSellRows.length} lines=${arbSummary.arbLines.length}`,
    // );

    return arbSummary;
  } catch (e: unknown) {
    const batchMsg = e instanceof Error ? e.message : String(e);
    // console.error(`[ArbQuoterScript] batch reverted: ${batchMsg}`);
    console.log("[ArbQuoterScript] switching to fallback single-pool mode...");
    const isolatedQuotes: ConfigImpactQuoteBatchResultStruct["quotes"] = [];
    const isolatedPoolMetas: PoolQuoteMeta[] = [];
    const isolatedErrors: string[] = [];
    let lastBlockNumber = 0n;
    let totalGasUsed = 0n;

    for (let i = 0; i < quoteInput.pairs.length; i++) {
      const pairInput = quoteInput.pairs[i];
      const meta = poolMetas[i];
      // console.log(
      //   `[ArbQuoterScript] fallback pool[${i}] dex=${meta.dex} version=${meta.version} address=${meta.poolAddress}`,
      // );
      try {
        const single = await callBatchQuote([pairInput]);
        const quote = single.quotes[0];
        if (!quote) {
          isolatedErrors.push(`${meta.poolAddress}: empty quote result`);
          console.warn(`[ArbQuoterScript] fallback pool[${i}] empty quote result`);
          continue;
        }
        isolatedQuotes.push(quote);
        isolatedPoolMetas.push(meta);
        lastBlockNumber = single.blockNumber;
        totalGasUsed += single.gasUsed;
        // console.log(
        //   `[ArbQuoterScript] fallback pool[${i}] success block=${single.blockNumber.toString()} gas=${single.gasUsed.toString()}`,
        // );
      } catch (singleErr: unknown) {
        const singleMsg = singleErr instanceof Error ? singleErr.message : String(singleErr);
        isolatedErrors.push(`${meta.poolAddress}: ${singleMsg.slice(0, 140)}`);
        // console.warn(`[ArbQuoterScript] fallback pool[${i}] failed: ${singleMsg}`);
        console.warn(`[ArbQuoterScript] fallback pool[${i}] failed`);
      }
    }

    if (isolatedQuotes.length > 0) {
      const isolatedResult: ConfigImpactQuoteBatchResultStruct = {
        quotes: isolatedQuotes,
        blockNumber: lastBlockNumber,
        gasUsed: totalGasUsed,
      };
      const built = buildQuoteRowsFromResult({
        result: isolatedResult,
        poolMetas: isolatedPoolMetas,
        amountInHuman,
        amountOutHuman,
        inSymbol,
        outSymbol,
        includeRevertHint,
      });
      const arbSummaryCandidates: ArbSummaryCandidate[] = [];
      arbSummaryCandidates.push(...built.arbSummaryCandidates);
      const arbSummary = buildArbSummary(arbSummaryCandidates);
      console.log(
        `[ArbQuoterScript] fallback completed successPools=${isolatedQuotes.length}/${quoteInput.pairs.length} failedPools=${isolatedErrors.length}`,
      );
      if (isolatedErrors.length > 0) {
        arbSummary.arbLines.push(
          `fallback single-pool mode: ${isolatedErrors.length} pool(s) failed`,
          ...isolatedErrors.slice(0, 5),
        );
      }
      return arbSummary;
    }

    console.error(
      `[ArbQuoterScript] all pools failed in fallback mode totalPools=${quoteInput.pairs.length} errors=${isolatedErrors.length}`,
    );

    for (const meta of poolMetas) {
      table.push(baseFailureRow(meta, inSymbol, outSymbol, includeRevertHint, batchMsg.slice(0, 160)));
    }

    return {
      bestBuyRows: [],
      bestSellRows: [],
      arbLines: [batchMsg, ...isolatedErrors.slice(0, 10)],
    };
  }
}












