import 'dotenv/config';
import { getGateioQuotes } from '../jobs/getGateioQuotes/getGateioQuotes';
import { IJobParams_get_Cex_Quotes } from '../store/state.types';
import { BotList10 } from '../store/stabs/bots-list.stabs';

async function main() {
  const jobParams = BotList10[5].jobParams as IJobParams_get_Cex_Quotes;

  console.log(`\n📋 Конфигурация Gate.io:`);
  console.log(`  Symbol: ${jobParams.symbol}`);

  const result = await getGateioQuotes(jobParams);

  if (!result.ok) {
    console.error(`\n❌ Ошибка: ${result.error}`);
    process.exit(1);
  }


  console.log(`\n✅ Готово за ${result.latencyMs} ms`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
