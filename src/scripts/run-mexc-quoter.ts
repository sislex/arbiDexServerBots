import 'dotenv/config';
import { getMexcQuotes } from '../jobs/getMexcQuotes/getMexcQuotes';
import { IJobParams_get_Cex_Quotes } from '../store/state.types';
import { BotList10 } from '../store/stabs/bots-list.stabs';

async function main() {
  const jobParams = BotList10[1].jobParams as IJobParams_get_Cex_Quotes;

  console.log(`\n📋 Конфигурация MEXC:`);
  console.log(`  Symbol: ${jobParams.symbol}`);

  const result = await getMexcQuotes(jobParams);

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
