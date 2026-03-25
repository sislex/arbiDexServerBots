import 'dotenv/config';
import { getKucoinQuotes } from '../jobs/getKucoinQuotes/getKucoinQuotes';
import { IJobParams_get_Kucoin_Quotes } from '../store/state.types';
import { BotList10 } from '../store/stabs/bots-list.stabs';

async function main() {
  const jobParams = BotList10[4].jobParams as IJobParams_get_Kucoin_Quotes;

  console.log(`\n📋 Конфигурация KuCoin:`);
  console.log(`  Symbol: ${jobParams.symbol}`);

  const result = await getKucoinQuotes(jobParams);

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

