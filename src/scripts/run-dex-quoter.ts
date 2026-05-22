import 'dotenv/config';
import {ArbitrumPoolsConfigListStabs} from './arbQuoter/networks/arbitrum/arbitrumPoolsConfigList.stabs.ts';
import type {IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script} from '../store/state.types.ts';
import {getDexQuotesByArbQuoterScript} from '../jobs/getDexQuotesByArbQuoterScript/getDexQuotesByArbQuoterScript.ts';

async function main() {
  const jobParams: IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script = ArbitrumPoolsConfigListStabs as IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script;
  const result = await getDexQuotesByArbQuoterScript(jobParams);
  console.log("Result:", result);
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
