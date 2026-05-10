import 'dotenv/config';
import { ethers } from 'ethers';
import ArbQuoterAbi from '../../../artifacts/contracts/ArbQuoter.sol/ArbQuoter.json';
import { buildStoreStep } from './buildStoreStep';
import { DeployedImpactQuoteStabsConfig, RunDeployedImpactQuoteTestOptions } from './types';

const IMPACT_FN =
  'quoteExactInWithImpact((uint8,address,address[],address,address,address,uint24,int24,address),uint256,uint256)';

function parseAmountList(defaultAmountIn: number): string[] {
  const raw = process.env.AMOUNTS_IN ?? process.env.AMOUNT_IN ?? String(defaultAmountIn);

  const amounts = raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  if (!amounts.length) {
    throw new Error('AMOUNTS_IN/AMOUNT_IN must contain at least one value');
  }

  return amounts;
}

function formatUnitsFixed(value: bigint, decimals: number, precision = 6): string {
  const num = Number(ethers.formatUnits(value, decimals));
  if (!Number.isFinite(num)) return ethers.formatUnits(value, decimals);
  if (num === 0) return '0';
  if (Math.abs(num) < 0.000001) return num.toExponential(4);
  return num.toFixed(precision);
}

function ratioNumber(numerator: bigint, numeratorDecimals: number, denominatorHuman: string): number {
  const num = Number(ethers.formatUnits(numerator, numeratorDecimals));
  const den = Number(denominatorHuman);

  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return Number.NaN;
  return num / den;
}

function formatNumberFixed(value: number, precision = 6): string {
  if (!Number.isFinite(value)) return 'n/a';
  if (value === 0) return '0';
  if (Math.abs(value) < 0.000001) return value.toExponential(4);
  return value.toFixed(precision);
}

function formatPercent(value: number, precision = 4): string {
  if (!Number.isFinite(value)) return 'n/a';
  return `${value.toFixed(precision)}%`;
}

function impactLevel(priceImpactPpm: bigint): string {
  const ppm = Number(priceImpactPpm);
  if (ppm >= 100_000) return 'CRITICAL >10%';
  if (ppm >= 50_000) return 'VERY_HIGH <=10%';
  if (ppm >= 10_000) return 'HIGH <=5%';
  if (ppm >= 3_000) return 'MEDIUM <=1%';
  if (ppm >= 1_000) return 'LOW <=0.3%';
  return 'OK <0.1%';
}

function resolvePair(config: DeployedImpactQuoteStabsConfig): { tokenIn: string; tokenOut: string } {
  const tokenIn = config.token0 ?? config.opts?.tokenIn?.address;
  const tokenOut = config.token1 ?? config.opts?.tokenOut?.address;

  if (!tokenIn || !tokenOut) {
    throw new Error('Missing token addresses: set token0/token1 or opts.tokenIn/out.address in config');
  }

  return { tokenIn, tokenOut };
}

type ArbSummaryCandidate = {
  amountIn: string;
  dex: string;
  version: string;
  pool: string;
  sellPriceOutPerIn: number;
  buyPriceOutPerIn: number;
};

function buildArbSummary(candidates: ArbSummaryCandidate[]) {
  const byAmountIn = new Map<string, ArbSummaryCandidate[]>();

  for (const candidate of candidates) {
    const rows = byAmountIn.get(candidate.amountIn) ?? [];
    rows.push(candidate);
    byAmountIn.set(candidate.amountIn, rows);
  }

  const bestBuyRows: Array<Record<string, string>> = [];
  const bestSellRows: Array<Record<string, string>> = [];
  const arbLines: string[] = [];

  for (const [amountIn, rows] of byAmountIn.entries()) {
    const validRows = rows.filter((row) =>
      Number.isFinite(row.sellPriceOutPerIn)
      && Number.isFinite(row.buyPriceOutPerIn)
      && row.sellPriceOutPerIn > 0
      && row.buyPriceOutPerIn > 0,
    );

    if (!validRows.length) {
      bestBuyRows.push({
        amountIn,
        bestBuyPriceOutPerIn: 'n/a',
        dex: 'n/a',
        version: 'n/a',
        pool: 'n/a',
      });
      bestSellRows.push({
        amountIn,
        bestSellPriceOutPerIn: 'n/a',
        dex: 'n/a',
        version: 'n/a',
        pool: 'n/a',
      });
      arbLines.push(`${amountIn}: no valid quotes for arbitrage check`);
      continue;
    }

    const bestBuy = validRows.reduce((best, row) =>
      row.buyPriceOutPerIn < best.buyPriceOutPerIn ? row : best,
    );

    const bestSell = validRows.reduce((best, row) =>
      row.sellPriceOutPerIn > best.sellPriceOutPerIn ? row : best,
    );

    const spread = bestSell.sellPriceOutPerIn - bestBuy.buyPriceOutPerIn;
    const canCrossPoolArb = bestSell.pool.toLowerCase() !== bestBuy.pool.toLowerCase() && spread > 0;
    const spreadPct = bestBuy.buyPriceOutPerIn > 0 ? (spread / bestBuy.buyPriceOutPerIn) * 100 : Number.NaN;

    bestBuyRows.push({
      amountIn,
      bestBuyPriceOutPerIn: formatNumberFixed(bestBuy.buyPriceOutPerIn),
      dex: bestBuy.dex,
      version: bestBuy.version,
      pool: bestBuy.pool,
    });
    bestSellRows.push({
      amountIn,
      bestSellPriceOutPerIn: formatNumberFixed(bestSell.sellPriceOutPerIn),
      dex: bestSell.dex,
      version: bestSell.version,
      pool: bestSell.pool,
    });

    arbLines.push(
      `${amountIn}: ${canCrossPoolArb ? 'ARB POSSIBLE' : 'NO ARB'} `
      + `(spread ${formatPercent(spreadPct)}; sell ${formatNumberFixed(bestSell.sellPriceOutPerIn)} - buy ${formatNumberFixed(bestBuy.buyPriceOutPerIn)})`,
    );
  }

  return { bestBuyRows, bestSellRows, arbLines };
}

function baseFailureRow(dex: string, version: string, pool: string, outSymbol: string, revertHint: string, includeRevertHint: boolean) {
  return {
    dex,
    version,
    pool,
    amountOut: `0 ${outSymbol}`,
    sellAmountOut: `0 ${outSymbol}`,
    priceOutPerIn: '0',
    sellPriceOutPerIn: '0',
    priceImpactPpm: '0',
    impactLevel: 'REVERT',
    canTradeAmountIn: false,
    success: false,
    ...(includeRevertHint ? { revertHint } : {}),
  };
}

export async function runDeployedImpactQuoteTest(options: RunDeployedImpactQuoteTestOptions): Promise<void> {
  const { networkName, envPrefix, configName, config, includeRevertHint = true } = options;

  const quoterAddress = process.env[`${envPrefix}_QUOTER_ADDRESS`] ?? process.env.QUOTER_ADDRESS;
  const rpcUrl = process.env[`${envPrefix}_RPC`] ?? config.rpcUrl;

  if (!quoterAddress) {
    throw new Error(`Missing ${envPrefix}_QUOTER_ADDRESS (or QUOTER_ADDRESS fallback) in .env`);
  }

  if (!rpcUrl) {
    throw new Error(`Missing ${envPrefix}_RPC and config.rpcUrl for ${configName}`);
  }

  const { tokenIn, tokenOut } = resolvePair(config);

  const inDecimals = config.opts?.tokenIn?.decimals ?? 6;
  const outDecimals = config.opts?.tokenOut?.decimals ?? 18;
  const inSymbol = config.opts?.tokenIn?.symbol ?? 'tokenIn';
  const outSymbol = config.opts?.tokenOut?.symbol ?? 'tokenOut';

  const configAmountIn = config.extraSettings?.amountIn;
  if (configAmountIn === undefined) {
    throw new Error(`Missing extraSettings.amountIn in ${configName}`);
  }

  if (!config.pairsToQuote.length) {
    throw new Error(`${configName}.pairsToQuote is empty`);
  }

  const amountInHumans = parseAmountList(configAmountIn);
  const referenceDivisor = BigInt(process.env.REFERENCE_DIVISOR ?? '100');

  if (referenceDivisor <= 0n) {
    throw new Error('REFERENCE_DIVISOR must be > 0');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const quoter = new ethers.Contract(quoterAddress, ArbQuoterAbi.abi, provider);

  const code = await provider.getCode(quoterAddress);
  if (code === '0x') {
    throw new Error(`No contract code at quoter ${quoterAddress}. Check ${envPrefix}_QUOTER_ADDRESS and ${envPrefix}_RPC.`);
  }

  const steps = config.pairsToQuote.map((pool) => buildStoreStep(pool, tokenIn, tokenOut, envPrefix));

  console.log('===========================================');
  console.log(`ArbQuoter impact quote test (${networkName})`);
  console.log('===========================================');
  console.log('RPC:', rpcUrl);
  console.log('Quoter:', quoterAddress);
  console.log('Pair:', `${tokenIn} -> ${tokenOut}`);
  console.log('Amounts in:', amountInHumans.map((x) => `${x} ${inSymbol}`).join(', '));
  console.log('Reference divisor:', referenceDivisor.toString());

  const table: Array<Record<string, string | boolean>> = [];
  const arbSummaryCandidates: ArbSummaryCandidate[] = [];

  let successCount = 0;
  let callsCount = 0;

  for (const amountInHuman of amountInHumans) {
    const amountIn = ethers.parseUnits(amountInHuman, inDecimals);
    const referenceAmountIn = amountIn / referenceDivisor || 1n;

    for (let i = 0; i < steps.length; i++) {
      const pool = config.pairsToQuote[i];
      callsCount += 1;

      try {
        const r = await quoter[IMPACT_FN].staticCall(steps[i], amountIn, referenceAmountIn) as {
          amountOut: bigint;
          outPerInX18: bigint;
          referenceOutPerInX18: bigint;
          priceImpactPpm: bigint;
          sellAmountOut: bigint;
          canTradeAmountIn: boolean;
          success: boolean;
        };

        if (r.success) successCount += 1;

        const sellPriceOutPerIn = ratioNumber(r.amountOut, outDecimals, amountInHuman);
        const buyPriceOutPerIn = ratioNumber(r.sellAmountOut, outDecimals, amountInHuman);

        if (r.success && r.canTradeAmountIn) {
          arbSummaryCandidates.push({
            amountIn: `${amountInHuman} ${inSymbol}`,
            dex: pool.dex,
            version: pool.version,
            pool: pool.poolAddress,
            sellPriceOutPerIn,
            buyPriceOutPerIn,
          });
        }

        table.push({
          amountIn: `${amountInHuman} ${inSymbol}`,
          dex: pool.dex,
          version: pool.version,
          pool: pool.poolAddress,
          amountOut: `${formatUnitsFixed(r.amountOut, outDecimals)} ${outSymbol}`,
          sellAmountOut: `${formatUnitsFixed(r.sellAmountOut, outDecimals)} ${outSymbol}`,
          priceOutPerIn: formatNumberFixed(sellPriceOutPerIn),
          sellPriceOutPerIn: formatNumberFixed(buyPriceOutPerIn),
          priceImpactPpm: r.priceImpactPpm.toString(),
          impactLevel: impactLevel(r.priceImpactPpm),
          canTradeAmountIn: r.canTradeAmountIn,
          success: r.success,
          ...(includeRevertHint ? { revertHint: '' } : {}),
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        table.push(baseFailureRow(pool.dex, pool.version, pool.poolAddress, outSymbol, message.slice(0, 160), includeRevertHint));
      }
    }
  }

  console.table(table);

  const arbSummary = buildArbSummary(arbSummaryCandidates);
  console.log('\nBest buy price:');
  console.table(arbSummary.bestBuyRows);
  console.log('\nBest sell price:');
  console.table(arbSummary.bestSellRows);
  console.log('\nCross-pool arbitrage:');
  for (const line of arbSummary.arbLines) {
    console.log(line);
  }

  console.log(`Success: ${successCount}/${callsCount}`);
}

