import 'dotenv/config';
import { ethers } from 'ethers';
import ArbQuoterAbi from '../../../../artifacts/contracts/ArbQuoter.sol/ArbQuoter.json';
import { ArbSummaryCandidate, buildArbSummary } from './buildArbSummary';
import { buildStoreStep } from './buildStoreStep';
import { impactLevel } from './impactLevel';
import { printImpactQuoteResults } from './printImpactQuoteResults';
import {
  baseFailureRow,
  formatNumberFixed,
  formatUnitsFixed,
  parseAmountList,
  ratioNumber,
  resolvePair,
} from './runDeployedImpactQuoteTestHelpers';
import { RunDeployedImpactQuoteTestOptions } from './types';

const IMPACT_FN =
  'quoteExactInWithImpact((uint8,address,address[],address,address,address,uint24,int24,address),uint256,uint256)';


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

  const arbSummary = buildArbSummary(arbSummaryCandidates);
  printImpactQuoteResults(table, arbSummary, successCount, callsCount);
}



