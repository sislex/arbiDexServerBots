import 'dotenv/config';
import {getDexQuotesByArbQuoter, TOKEN_PAIR} from '../jobs/getDexQuotesByArbQuoter/getDexQuotesByArbQuoter';
import { IJobParams_get_Dex_Quotes_By_Arb_Quoter } from '../store/state.types';
import {BotList10} from '../store/stabs/bots-list.stabs';
import { printQuotesTable } from '../jobs/getDexQuotesByArbQuoter/helpers/printQuotesTable';
import { printUnifiedQuotesTable, marketDataClient } from '../jobs/shared';

async function main() {
  const jobParams = BotList10[7].jobParams as IJobParams_get_Dex_Quotes_By_Arb_Quoter;

  const consoleOutput = true;
  const humanReadable = true;

  const result = await getDexQuotesByArbQuoter(jobParams, {
    tokenPair: TOKEN_PAIR,
    humanReadable,
  });

  if (consoleOutput) {
    console.log(`\n📋 Конфигурация:`);
    console.log(`  QUOTER_ADDRESS: ${process.env.QUOTER_ADDRESS ?? '❌ не задан'}`);
    console.log(`  RPC:            ${jobParams.rpcUrl}`);
    console.log(`  Пулов в конфиге: ${jobParams.pairsToQuote.length}`);
    console.log(`  tokenIn:        ${TOKEN_PAIR.tokenIn.symbol}  amount=${TOKEN_PAIR.tokenIn.amount}`);
    console.log(`  tokenOut:       ${TOKEN_PAIR.tokenOut.symbol}  amount=${TOKEN_PAIR.tokenOut.amount}`);

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
