import 'dotenv/config';
import {ArbitrumPoolsConfigListStabs} from './arbQuoter/networks/arbitrum/arbitrumPoolsConfigList.stabs.ts';
import type {IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script} from '../store/state.types.ts';
import {getDexQuotesByArbQuoterScript} from '../jobs/getDexQuotesByArbQuoterScript/getDexQuotesByArbQuoterScript.ts';
import { marketDataClient } from '../jobs/shared/market-data-client.ts';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const jobParams: IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script = ArbitrumPoolsConfigListStabs as IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script;
  const result = await getDexQuotesByArbQuoterScript(jobParams);
  console.log('Result:', result);

  // Give socket.io a small window to establish connection and flush writes.
  await sleep(1500);
  marketDataClient.disconnect();
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
