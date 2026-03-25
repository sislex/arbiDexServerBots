import 'dotenv/config';
import { executeArbFromStore } from '../jobs/getQuoteFromArbExecutor/helpers/executeArbFromStore';
import { IJobType, IQuote } from '../store/state.types';
import { BotListFiltered } from '../store/stabs/bots-list.stabs';

let pairsToQuote: IQuote[] = [];
if (BotListFiltered[0].jobParams.jobType === IJobType.GET_ARB_EXECUTOR_QUOTES) {
  pairsToQuote = BotListFiltered[0].jobParams.pairsToQuote;
}

const jobParams = {
  jobType: IJobType.GET_ARB_EXECUTOR_QUOTES as const,
  rpcUrl: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
  pairsToQuote,
};

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('  executeArbFromStore — поиск + симуляция + (опционально) swap');
  console.log(`${'='.repeat(60)}\n`);

  const result = await executeArbFromStore(jobParams, {
    storeKey: 'pools33',
    minProfitPct: 0.03,   // минимум 0.03% для реального свопа
    executeReal: false,    // false = только симуляция, true = реальный своп
    slippageBps: 30,       // 0.30%
    maxFeePerGasGwei: 0.5,         // максимальная цена газа (gwei)
    maxPriorityFeePerGasGwei: 0.1, // чаевые (gwei)
  });

  console.log('\n📊 Результат:', JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

