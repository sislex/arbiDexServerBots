import 'dotenv/config';
import { getCexQuotes } from '../jobs/getCexQuotes/getCexQuotes';
import { printCexQuotesTable } from '../jobs/getCexQuotes/printCexQuotesTable';
import { IJobParams_get_Cex_Quotes } from '../store/state.types';
import { BotList10 } from '../store/stabs/bots-list.stabs';
import { printUnifiedQuotesTable, marketDataClient } from '../jobs/shared';

async function main() {
  const jobParams = BotList10[2].jobParams as IJobParams_get_Cex_Quotes;

  console.log(`\n📋 Конфигурация ${jobParams.source}:`);
  console.log(`  Token0: ${jobParams.token0}, Token1: ${jobParams.token1}`);

  const result = await getCexQuotes(jobParams);

  if (!result.ok) {
    console.error(`\n❌ Ошибка: ${result.error}`);
    process.exit(1);
  }

  printCexQuotesTable(jobParams.source, result);

  if (result.unified) {
    printUnifiedQuotesTable(result.unified);
  }

  console.log(`\n✅ Готово за ${result.latencyMs} ms`);
  marketDataClient.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
