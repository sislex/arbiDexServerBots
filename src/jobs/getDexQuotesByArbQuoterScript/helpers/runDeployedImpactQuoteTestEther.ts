import {
  stabsConfigToQuoteInput,
  type DeployedImpactQuoteStabsConfig,
  type PoolQuoteMeta,
} from './configQuoteInput.js';
import { ethers } from 'ethers';
import {
  buildQuoteRowsFromResult,
  type ConfigImpactQuoteBatchResultStruct,
  type QuoteTableRow,
} from './buildQuoteRowsFromResult.js';
import { resolveQuoterEther } from './resolveQuoterEther.js';
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

function parseSingleAmountIn(
  configAmountIn: number | number[],
  configName: string,
): string {
  if (Array.isArray(configAmountIn)) {
    throw new Error(
      `extraSettings.amountIn must be a single number in ${configName}`,
    );
  }

  const amount = String(configAmountIn).trim();
  if (!amount) {
    throw new Error(`Missing extraSettings.amountIn in ${configName}`);
  }

  return amount;
}

function parseOptionalAmountOut(
  configAmountOut: number | undefined,
): string | undefined {
  if (configAmountOut === undefined || configAmountOut <= 0) return undefined;
  return String(configAmountOut);
}

function x18ToNumber(value: bigint): number {
  const parsed = Number(ethers.formatUnits(value, 18));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function rawToNumber(value: bigint, decimals: number): number {
  const parsed = Number(ethers.formatUnits(value, decimals));
  return Number.isFinite(parsed) ? parsed : NaN;
}

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

function printContractBestQuoteDiagnostics(
  result: ConfigImpactQuoteBatchResultStruct,
  poolMetas: PoolQuoteMeta[],
  amountInHuman: string,
  amountOutHuman: string | undefined,
  inSymbol: string,
  outSymbol: string,
  inDecimals: number,
  outDecimals: number,
) {
  let bestContractBuy:
    | {
        quote: ConfigImpactQuoteBatchResultStruct['quotes'][number];
        meta?: PoolQuoteMeta;
      }
    | undefined;
  let bestContractSell:
    | {
        quote: ConfigImpactQuoteBatchResultStruct['quotes'][number];
        meta?: PoolQuoteMeta;
      }
    | undefined;

  for (let i = 0; i < result.quotes.length; i++) {
    const quote = result.quotes[i];
    const meta = poolMetas[i];

    if (quote?.buy?.success && quote.buyPriceOutPerInX18 > 0n) {
      if (
        !bestContractBuy ||
        quote.buyPriceOutPerInX18 > bestContractBuy.quote.buyPriceOutPerInX18
      ) {
        bestContractBuy = { quote, meta };
      }
    }

    if (
      quote?.sellEnabled &&
      quote?.sell?.success &&
      quote.sellPriceOutPerInX18 > 0n
    ) {
      if (
        !bestContractSell ||
        quote.sellPriceOutPerInX18 < bestContractSell.quote.sellPriceOutPerInX18
      ) {
        bestContractSell = { quote, meta };
      }
    }
  }

  // console.log('[ArbQuoterScript] contract best quotes diagnostics');
  // console.log(
  //   `[ArbQuoterScript] contract price unit=${outSymbol}/${inSymbol}; unified price unit=${inSymbol}/${outSymbol}`,
  // );

  if (bestContractBuy) {
    const q = bestContractBuy.quote;
    const contractPrice = x18ToNumber(q.buyPriceOutPerInX18);
    const unifiedAsk = contractPrice > 0 ? 1 / contractPrice : NaN;
    const amountIn = Number(amountInHuman);
    const amountOut = rawToNumber(q.buy.amountOut, outDecimals);
    const recalculatedAmountOut = amountIn / unifiedAsk;

    // console.table([
    //   {
    //     side: `BUY ${outSymbol}`,
    //     dex: bestContractBuy.meta?.dex,
    //     version: bestContractBuy.meta?.version,
    //     pool: q.pool,
    //     amountIn: `${amountInHuman} ${inSymbol}`,
    //     amountOut: `${formatDiagnosticNumber(amountOut)} ${outSymbol}`,
    //     contractPriceOutPerIn: formatDiagnosticNumber(contractPrice),
    //     unifiedAskInPerOut: formatDiagnosticNumber(unifiedAsk),
    //     recalculatedOut: `${formatDiagnosticNumber(recalculatedAmountOut)} ${outSymbol}`,
    //     diffOut: formatDiff(recalculatedAmountOut - amountOut),
    //   },
    // ]);
  } else {
    console.log(
      `[ArbQuoterScript] no successful contract BUY quotes (${inSymbol} -> ${outSymbol})`,
    );
  }

  if (bestContractSell && amountOutHuman) {
    const q = bestContractSell.quote;
    const contractPrice = x18ToNumber(q.sellPriceOutPerInX18);
    const unifiedBid = contractPrice > 0 ? 1 / contractPrice : NaN;
    const amountOut = Number(amountOutHuman);
    const sellOut = rawToNumber(q.sell.amountOut, inDecimals);
    const recalculatedSellOut = amountOut * unifiedBid;

    // console.table([
    //   {
    //     side: `SELL ${outSymbol}`,
    //     dex: bestContractSell.meta?.dex,
    //     version: bestContractSell.meta?.version,
    //     pool: q.pool,
    //     amountIn: `${amountOutHuman} ${outSymbol}`,
    //     amountOut: `${formatDiagnosticNumber(sellOut)} ${inSymbol}`,
    //     contractPriceOutPerIn: formatDiagnosticNumber(contractPrice),
    //     unifiedBidInPerOut: formatDiagnosticNumber(unifiedBid),
    //     recalculatedOut: `${formatDiagnosticNumber(recalculatedSellOut)} ${inSymbol}`,
    //     diffOut: formatDiff(recalculatedSellOut - sellOut),
    //   },
    // ]);
  } else if (amountOutHuman) {
    console.log(
      `[ArbQuoterScript] no successful contract SELL quotes (${outSymbol} -> ${inSymbol})`,
    );
  }
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
    kind: 'n/a',
    buyAmountOut: `0 ${outSymbol}`,
    buyPriceOutPerIn: '0',
    buyImpactPpm: '0',
    buyImpactLevel: 'REVERT',
    sellEnabled: false,
    sellAmountOut: `0 ${inSymbol}`,
    sellPriceOutPerIn: 'n/a',
    sellImpactPpm: '0',
    sellImpactLevel: 'n/a',
    success: false,
  };

  if (includeRevertHint) {
    row.revertHint = revertHint;
  }

  return row;
}

export async function runDeployedImpactQuoteTestEther(
  options: RunDeployedImpactQuoteTestEtherOptions,
): Promise<ArbSummaryResult> {
  const { networkEnvPrefix, config, includeRevertHint = true } = options;

  const rpcUrl = config.rpcUrl;
  const quoterEnvKey = `${networkEnvPrefix}_QUOTER_ADDRESS`;
  const inSymbol = config.opts?.tokenIn?.symbol ?? 'tokenIn';
  const outSymbol = config.opts?.tokenOut?.symbol ?? 'tokenOut';
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
    throw new Error(
      `extraSettings.referenceDivisor must be > 0 in ${networkEnvPrefix}`,
    );
  }

  const { quoter } = await resolveQuoterEther({
    quoterEnvKey,
    networkEnvPrefix,
    rpcUrl,
  });

  // console.log(
  //   `[ArbQuoterScript] start network=${networkEnvPrefix} rpc=${rpcUrl} pools=${config.pairsToQuote.length} amountIn=${amountInHuman} ${inSymbol} amountOut=${amountOutHuman ?? "disabled"} ${outSymbol} refDiv=${referenceDivisor.toString()}`,
  // );

  const table: QuoteTableRow[] = [];

  const { quoteInput, poolMetas, skippedPairs } = stabsConfigToQuoteInput(
    config,
    {
      amountInHuman,
      amountOutHuman,
      referenceDivisor,
      networkEnvPrefix,
    },
  );

  if (skippedPairs.length) {
    console.warn(
      `[ArbQuoterScript] skipped ${skippedPairs.length} unsupported pool(s): ${skippedPairs.slice(0, 3).join('; ')}`,
    );
  }

  const callBatchQuote = async (pairsOverride?: typeof quoteInput.pairs) => {
    const input = pairsOverride
      ? { ...quoteInput, pairs: pairsOverride }
      : quoteInput;
    return (await (quoter as any).quoteConfigExactInWithImpact.staticCall(
      input,
    )) as ConfigImpactQuoteBatchResultStruct;
  };

  try {
    const result = await callBatchQuote();
    printContractBestQuoteDiagnostics(
      result,
      poolMetas,
      amountInHuman,
      amountOutHuman,
      inSymbol,
      outSymbol,
      quoteInput.tokenInDecimals,
      quoteInput.tokenOutDecimals,
    );
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
    if (skippedPairs.length) {
      arbSummary.arbLines.unshift(
        `skipped unsupported pools: ${skippedPairs.length}`,
        ...skippedPairs.slice(0, 5),
      );
    }
    // console.log(
    //   `[ArbQuoterScript] summary rows buy=${arbSummary.bestBuyRows.length} sell=${arbSummary.bestSellRows.length} lines=${arbSummary.arbLines.length}`,
    // );

    return arbSummary;
  } catch (e: unknown) {
    const batchMsg = e instanceof Error ? e.message : String(e);
    // console.error(`[ArbQuoterScript] batch reverted: ${batchMsg}`);
    console.log('[ArbQuoterScript] switching to fallback single-pool mode...');
    const isolatedQuotes: ConfigImpactQuoteBatchResultStruct['quotes'] = [];
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
          console.warn(
            `[ArbQuoterScript] fallback pool[${i}] empty quote result`,
          );
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
        const singleMsg =
          singleErr instanceof Error ? singleErr.message : String(singleErr);
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
      printContractBestQuoteDiagnostics(
        isolatedResult,
        isolatedPoolMetas,
        amountInHuman,
        amountOutHuman,
        inSymbol,
        outSymbol,
        quoteInput.tokenInDecimals,
        quoteInput.tokenOutDecimals,
      );
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
      if (skippedPairs.length > 0) {
        arbSummary.arbLines.unshift(
          `skipped unsupported pools: ${skippedPairs.length}`,
          ...skippedPairs.slice(0, 5),
        );
      }
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
      table.push(
        baseFailureRow(
          meta,
          inSymbol,
          outSymbol,
          includeRevertHint,
          batchMsg.slice(0, 160),
        ),
      );
    }

    return {
      bestBuyRows: [],
      bestSellRows: [],
      arbLines: [
        batchMsg,
        ...skippedPairs.slice(0, 5),
        ...isolatedErrors.slice(0, 10),
      ],
    };
  }
}
