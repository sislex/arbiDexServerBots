import 'dotenv/config';
import { getDexQuotesByArbQuoter } from '../jobs/getDexQuotesByArbQuoter/getDexQuotesByArbQuoter';
import { toAmount } from '../jobs/getDexQuotesByArbQuoter/helpers/toAmount';
import { marketDataClient } from '../jobs/shared';
import { buildArbSummary } from './arbQuoter/networks/helpers/buildArbSummary';
import { printImpactQuoteResults } from './arbQuoter/networks/helpers/printImpactQuoteResults';
import {
  formatNumberFixed,
  parseExtraSettings,
  resolveConfigFromArgs,
  resolveQuoterEnvKeyBySource,
  toJobParams,
} from './arbQuoter/networks/helpers/runArbQuoter.helpers';

async function main() {
  const { config, key: selectedConfigKey } = resolveConfigFromArgs();


  const jobParams = toJobParams(config);

  const quoterEnvKey = resolveQuoterEnvKeyBySource(jobParams.source);
  const selectedQuoterAddress = process.env[quoterEnvKey] ?? process.env.QUOTER_ADDRESS;

  // Для source, отличных от optimism, core-джоба смотрит на QUOTER_ADDRESS.
  if (selectedQuoterAddress) {
    process.env.QUOTER_ADDRESS = selectedQuoterAddress;
  }

  // Берём amountIn / amountOut из extraSettings бота
  const parsedSettings = parseExtraSettings(jobParams.extraSettings);
  const inDecimals  = jobParams.opts?.tokenIn?.decimals  ?? 18;
  const outDecimals = jobParams.opts?.tokenOut?.decimals ?? 18;

  // Адрес: opts.tokenIn.address (новый формат) или устаревший token0
  const tokenInAddress  = jobParams.opts?.tokenIn?.address  ?? jobParams.token0 ?? '';
  const tokenOutAddress = jobParams.opts?.tokenOut?.address ?? jobParams.token1 ?? '';

  const amountInValue = Number(parsedSettings?.amountIn ?? 0);
  const amountOutValue = Number(parsedSettings?.amountOut ?? 0);
  const hasAmountOutFallback = !(amountOutValue > 0);
  const effectiveAmountOutValue = hasAmountOutFallback ? 1 : amountOutValue;

  const TOKEN_PAIR = {
    tokenIn: {
      address:  tokenInAddress,
      amount:   toAmount(amountInValue, inDecimals),
      decimals: inDecimals,
      symbol:   jobParams.opts?.tokenIn?.symbol ?? tokenInAddress,
    },
    tokenOut: {
      address:  tokenOutAddress,
      amount:   toAmount(effectiveAmountOutValue, outDecimals),
      decimals: outDecimals,
      symbol:   jobParams.opts?.tokenOut?.symbol ?? tokenOutAddress,
    },
  };

  const consoleOutput = true;
  const humanReadable = true;
  const result = await getDexQuotesByArbQuoter(jobParams, { humanReadable });

  if (!result.ok) {
    throw new Error(result.error ?? 'getDexQuotesByArbQuoter failed');
  }

  if (consoleOutput) {
    console.log('===========================================');
    console.log(`ArbQuoter quote job (${selectedConfigKey})`);
    console.log('===========================================');
    console.log('RPC:', jobParams.rpcUrl);
    console.log('Source:', jobParams.source);
    console.log('Quoter env key:', quoterEnvKey);
    console.log('Selected quoter:', selectedQuoterAddress ?? 'not set');
    console.log('Pair:', `${TOKEN_PAIR.tokenIn.symbol} -> ${TOKEN_PAIR.tokenOut.symbol}`);
    console.log('Amount in:', `${amountInValue} ${TOKEN_PAIR.tokenIn.symbol}`);
    console.log('Amount out:', `${effectiveAmountOutValue} ${TOKEN_PAIR.tokenOut.symbol}`);
    if (hasAmountOutFallback) {
      console.log('Note: amountOut <= 0, fallback amountOut=1 is used for sell quotes');
    }

    const amountInLabel = `${amountInValue} ${TOKEN_PAIR.tokenIn.symbol}`;
    const table = result.allQuotes.map((q) => ({
      amountIn: amountInLabel,
      dex: q.dex,
      version: q.version,
      pool: q.poolAddress,
      amountOut: q.buyAmountOutFormatted,
      sellAmountOut: q.sellAmountOutFormatted,
      priceOutPerIn: formatNumberFixed(q.sellPrice),
      sellPriceOutPerIn: formatNumberFixed(q.buyPrice),
      priceImpactPpm: 'n/a',
      impactLevel: 'n/a',
      canTradeAmountIn: q.buySuccess && q.sellSuccess,
      success: q.buySuccess && q.sellSuccess,
    }));

    const arbSummary = buildArbSummary(
      result.allQuotes
        .filter((q) => q.buySuccess && q.sellSuccess)
        .map((q) => ({
          amountIn: amountInLabel,
          dex: q.dex,
          version: q.version,
          pool: q.poolAddress,
          sellPriceOutPerIn: q.sellPrice,
          buyPriceOutPerIn: q.buyPrice,
        })),
    );

    printImpactQuoteResults(table, arbSummary, result.allQuotes.filter((q) => q.buySuccess && q.sellSuccess).length, result.allQuotes.length);
  }

  marketDataClient.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
