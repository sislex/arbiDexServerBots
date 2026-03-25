import 'dotenv/config';
import { getBinanceQuotes } from '../jobs/getBinanceQuotes/getBinanceQuotes';
import { IJobParams_get_Binance_Quotes } from '../store/state.types';
import { BotList10 } from '../store/stabs/bots-list.stabs';

async function main() {
  const jobParams = BotList10[0].jobParams as IJobParams_get_Binance_Quotes;

  console.log(`\n📋 Конфигурация Binance:`);
  console.log(`  URL:    ${jobParams.rpcUrl}`);
  console.log(`  Symbol: ${jobParams.symbol}`);

  const result = await getBinanceQuotes(jobParams);

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

