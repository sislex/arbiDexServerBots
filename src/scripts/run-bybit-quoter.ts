import 'dotenv/config';
import { getBybitQuotes } from '../jobs/getBybitQuotes/getBybitQuotes';
import { IJobParams_get_Bybit_Quotes } from '../store/state.types';
import { BotList10 } from '../store/stabs/bots-list.stabs';

async function main() {
  const jobParams = BotList10[2].jobParams as IJobParams_get_Bybit_Quotes;

  console.log(`\n📋 Конфигурация Bybit:`);
  console.log(`  Symbol: ${jobParams.symbol}`);

  const result = await getBybitQuotes(jobParams);

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

