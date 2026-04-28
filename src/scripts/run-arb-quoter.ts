import 'dotenv/config';
import { getDexQuotesByArbQuoter } from '../jobs/getDexQuotesByArbQuoter/getDexQuotesByArbQuoter';
import { toAmount } from '../jobs/getDexQuotesByArbQuoter/helpers/toAmount';
import { IJobParams_get_Dex_Quotes_By_Arb_Quoter, IJobType } from '../store/state.types';
import { BotListTestArbitrum } from '../store/stabs/bots-list.stabs';
import { printQuotesTable } from '../jobs/getDexQuotesByArbQuoter/helpers/printQuotesTable';
import { printUnifiedQuotesTable, marketDataClient } from '../jobs/shared';

async function main() {
  const dexBot = BotListTestArbitrum.find(b => b.jobParams.jobType === IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER);
  if (!dexBot) throw new Error('DEX bot not found in BotListTestArbitrum');
  const jobParams = dexBot.jobParams as IJobParams_get_Dex_Quotes_By_Arb_Quoter;

  // Берём amountIn / amountOut из extraSettings бота
  const parsedSettings = jobParams.extraSettings ? JSON.parse(jobParams.extraSettings) : {};
  const inDecimals  = jobParams.opts?.tokenIn?.decimals  ?? 18;
  const outDecimals = jobParams.opts?.tokenOut?.decimals ?? 18;

  // Адрес: opts.tokenIn.address (новый формат) или устаревший token0
  const tokenInAddress  = jobParams.opts?.tokenIn?.address  ?? jobParams.token0 ?? '';
  const tokenOutAddress = jobParams.opts?.tokenOut?.address ?? jobParams.token1 ?? '';

  const TOKEN_PAIR = {
    tokenIn: {
      address:  tokenInAddress,
      amount:   toAmount(parsedSettings?.amountIn  ?? 0, inDecimals),
      decimals: inDecimals,
      symbol:   jobParams.opts?.tokenIn?.symbol ?? tokenInAddress,
    },
    tokenOut: {
      address:  tokenOutAddress,
      amount:   toAmount(parsedSettings?.amountOut ?? 0, outDecimals),
      decimals: outDecimals,
      symbol:   jobParams.opts?.tokenOut?.symbol ?? tokenOutAddress,
    },
  };

  const consoleOutput = true;
  const humanReadable = true;

  const result = await getDexQuotesByArbQuoter(jobParams, { humanReadable });

  if (consoleOutput) {
    console.log(`\n📋 Конфигурация:`);
    console.log(`  QUOTER_ADDRESS:  ${process.env.QUOTER_ADDRESS ?? '❌ не задан'}`);
    console.log(`  RPC:             ${jobParams.rpcUrl}`);
    console.log(`  Пулов в конфиге: ${jobParams.pairsToQuote.length}`);
    console.log(`  tokenIn:         ${TOKEN_PAIR.tokenIn.symbol}  amount=${parsedSettings?.amountIn ?? 0}`);
    console.log(`  tokenOut:        ${TOKEN_PAIR.tokenOut.symbol}  amount=${parsedSettings?.amountOut ?? 0}`);

    printQuotesTable(result, { tokenPair: TOKEN_PAIR, humanReadable });

    if (result.unified) {
      printUnifiedQuotesTable(result.unified);
    }
  }

  marketDataClient.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
