import 'dotenv/config';
import { getExecutorBalances } from '../jobs/getExecutorBalances/getExecutorBalances';
import { IJobType } from '../store/state.types';

async function main() {
  const result = await getExecutorBalances({
    jobType: IJobType.GET_EXECUTOR_BALANCES,
  });

  if (!result.ok) {
    console.error('❌ Error:', result.error);
    return;
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('  💰 ArbExecutor Balances');
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Contract:    ${result.executorAddress}`);
  console.log(`  Block:       ${result.blockNumber}`);
  console.log(`  Latency:     ${result.latencyMs} ms`);
  console.log(`  ETH Balance: ${result.ethFormatted} ETH`);

  if (result.tokens.length > 0) {
    console.log(`\n  Tokens:`);
    for (const t of result.tokens) {
      console.log(`    ${t.symbol.padEnd(8)} ${t.formatted.padStart(20)}  (${t.address})`);
    }
  } else {
    console.log(`\n  No tracked tokens with balance`);
  }
  console.log();
  process.exit(0);
}

main().catch(console.error);

