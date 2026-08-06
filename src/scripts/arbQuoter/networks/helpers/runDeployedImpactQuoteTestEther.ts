// @ts-nocheck
import { ethers } from 'ethers';
import {
  stabsConfigToQuoteInput,
  type DeployedImpactQuoteStabsConfig,
  type PoolQuoteMeta,
} from './configQuoteInput.ts';
import {
  buildArbSummary,
  type ArbSummaryCandidate,
} from './buildArbSummary.ts';
import {
  buildQuoteRowsFromResult,
  type ConfigImpactQuoteBatchResultStruct,
  type QuoteTableRow,
} from './buildQuoteRowsFromResult.ts';
import { resolveQuoterEther } from './resolveQuoterEther.ts';

export type { DeployedImpactQuoteStabsConfig } from './configQuoteInput.ts';

type RunDeployedImpactQuoteTestEtherOptions = {
  networkName: string;
  networkEnvPrefix?: string;
  quoterEnvKey: string;
  configName: string;
  config: DeployedImpactQuoteStabsConfig;
  includeRevertHint?: boolean;
  rpcUrl?: string;
};

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
  const validBuyQuotes = result.quotes
    .map((quote, index) => ({ quote, meta: poolMetas[index] }))
    .filter(
      ({ quote }) => quote?.buy?.success && quote.buyPriceOutPerInX18 > 0n,
    );

  const validSellQuotes = result.quotes
    .map((quote, index) => ({ quote, meta: poolMetas[index] }))
    .filter(
      ({ quote }) =>
        quote?.sellEnabled &&
        quote?.sell?.success &&
        quote.sellPriceOutPerInX18 > 0n,
    );

  const bestContractBuy = validBuyQuotes.reduce(
    (best, current) =>
      current.quote.buyPriceOutPerInX18 > best.quote.buyPriceOutPerInX18
        ? current
        : best,
    validBuyQuotes[0],
  );
  const bestContractSell = validSellQuotes.reduce(
    (best, current) =>
      current.quote.sellPriceOutPerInX18 < best.quote.sellPriceOutPerInX18
        ? current
        : best,
    validSellQuotes[0],
  );

  console.log('\nContract best quotes diagnostics');
  console.log(
    `Contract price unit: ${outSymbol} per 1 ${inSymbol}; unified price unit: ${inSymbol} per 1 ${outSymbol}`,
  );

  if (bestContractBuy) {
    const q = bestContractBuy.quote;
    const contractPrice = x18ToNumber(q.buyPriceOutPerInX18);
    const unifiedAsk = contractPrice > 0 ? 1 / contractPrice : NaN;
    const amountIn = Number(amountInHuman);
    const amountOut = rawToNumber(q.buy.amountOut, outDecimals);
    const recalculatedAmountOut = amountIn / unifiedAsk;

    console.table([
      {
        side: `BUY ${outSymbol}`,
        dex: bestContractBuy.meta?.dex,
        version: bestContractBuy.meta?.version,
        pool: q.pool,
        amountIn: `${amountInHuman} ${inSymbol}`,
        amountOut: `${formatDiagnosticNumber(amountOut)} ${outSymbol}`,
        contractPriceOutPerIn: formatDiagnosticNumber(contractPrice),
        unifiedAskInPerOut: formatDiagnosticNumber(unifiedAsk),
        recalculatedOut: `${formatDiagnosticNumber(recalculatedAmountOut)} ${outSymbol}`,
        diffOut: formatDiff(recalculatedAmountOut - amountOut),
      },
    ]);
  } else {
    console.log(
      `No successful contract BUY quotes (${inSymbol} -> ${outSymbol})`,
    );
  }

  if (bestContractSell && amountOutHuman) {
    const q = bestContractSell.quote;
    const contractPrice = x18ToNumber(q.sellPriceOutPerInX18);
    const unifiedBid = contractPrice > 0 ? 1 / contractPrice : NaN;
    const amountOut = Number(amountOutHuman);
    const sellOut = rawToNumber(q.sell.amountOut, inDecimals);
    const recalculatedSellOut = amountOut * unifiedBid;

    console.table([
      {
        side: `SELL ${outSymbol}`,
        dex: bestContractSell.meta?.dex,
        version: bestContractSell.meta?.version,
        pool: q.pool,
        amountIn: `${amountOutHuman} ${outSymbol}`,
        amountOut: `${formatDiagnosticNumber(sellOut)} ${inSymbol}`,
        contractPriceOutPerIn: formatDiagnosticNumber(contractPrice),
        unifiedBidInPerOut: formatDiagnosticNumber(unifiedBid),
        recalculatedOut: `${formatDiagnosticNumber(recalculatedSellOut)} ${inSymbol}`,
        diffOut: formatDiff(recalculatedSellOut - sellOut),
      },
    ]);
  } else if (amountOutHuman) {
    console.log(
      `No successful contract SELL quotes (${outSymbol} -> ${inSymbol})`,
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
) {
  const {
    networkName,
    networkEnvPrefix,
    quoterEnvKey,
    configName,
    config,
    includeRevertHint = true,
    rpcUrl,
  } = options;

  const inSymbol = config.opts?.tokenIn?.symbol ?? 'tokenIn';
  const outSymbol = config.opts?.tokenOut?.symbol ?? 'tokenOut';

  const configAmountIn = config.extraSettings?.amountIn;
  if (configAmountIn === undefined) {
    throw new Error(`Missing extraSettings.amountIn in ${configName}`);
  }
  const configReferenceDivisor = config.extraSettings?.referenceDivisor ?? 100;

  if (!config.pairsToQuote.length) {
    throw new Error(`${configName}.pairsToQuote is empty`);
  }

  const amountInHuman = parseSingleAmountIn(configAmountIn, configName);
  const amountOutHuman = parseOptionalAmountOut(
    config.extraSettings?.amountOut,
  );
  const referenceDivisor = BigInt(configReferenceDivisor);
  if (referenceDivisor <= 0n) {
    throw new Error(
      `extraSettings.referenceDivisor must be > 0 in ${configName}`,
    );
  }

  const { quoter, quoterAddress, providerNetwork } = await resolveQuoterEther({
    quoterEnvKey,
    networkEnvPrefix,
    rpcUrl,
  });

  console.log('===========================================');
  console.log(`ArbQuoter config impact quote test (${networkName}, ethers)`);
  console.log('===========================================');
  console.log('Chain id:', providerNetwork.chainId.toString());
  console.log('Quoter:', quoterAddress, '(deployed)');
  console.log('Amount in:', `${amountInHuman} ${inSymbol}`);
  console.log(
    'Amount out sell input:',
    amountOutHuman
      ? `${amountOutHuman} ${outSymbol}`
      : 'disabled (ExactIn buy only)',
  );
  console.log('Reference divisor:', referenceDivisor.toString());
  console.log('Expected contract calls:', 1);

  const table: QuoteTableRow[] = [];
  const arbSummaryCandidates: ArbSummaryCandidate[] = [];
  let contractCallsCount = 0;
  let successQuotesCount = 0;
  let totalQuotesCount = 0;

  const { quoteInput, poolMetas } = stabsConfigToQuoteInput(config, {
    amountInHuman,
    amountOutHuman,
    referenceDivisor,
    networkEnvPrefix,
  });

  contractCallsCount++;

  try {
    const result = (await (
      quoter as any
    ).quoteConfigExactInWithImpact.staticCall(
      quoteInput,
    )) as ConfigImpactQuoteBatchResultStruct;

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

    const built = buildQuoteRowsFromResult({
      result,
      poolMetas,
      amountInHuman,
      amountOutHuman,
      inSymbol,
      outSymbol,
      includeRevertHint,
    });

    totalQuotesCount += built.totalQuotesCount;
    successQuotesCount += built.successQuotesCount;
    arbSummaryCandidates.push(...built.arbSummaryCandidates);
    table.push(...built.tableRows);

    console.log(
      `Call result: block=${result.blockNumber} gas=${result.gasUsed} quotes=${result.quotes.length}`,
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    totalQuotesCount += poolMetas.length;
    for (const meta of poolMetas) {
      table.push(
        baseFailureRow(
          meta,
          inSymbol,
          outSymbol,
          includeRevertHint,
          msg.slice(0, 160),
        ),
      );
    }
  }

  console.table(table);

  if (amountOutHuman) {
    const arbSummary = buildArbSummary(arbSummaryCandidates);
    console.log('\nBest buy price (reverse sell quote, lower is better)');
    console.table(arbSummary.bestBuyRows);
    console.log('\nBest sell price (forward buy quote, higher is better)');
    console.table(arbSummary.bestSellRows);
    console.log('\nCross-pool arbitrage');
    for (const line of arbSummary.arbLines) {
      console.log(line);
    }
  } else {
    console.log(
      '\nCross-pool arbitrage skipped: amountOut is not set, only ExactIn buy quotes were requested.',
    );
  }

  console.log(`Contract calls: ${contractCallsCount}`);
  console.log(`Quote rows success: ${successQuotesCount}/${totalQuotesCount}`);
}
