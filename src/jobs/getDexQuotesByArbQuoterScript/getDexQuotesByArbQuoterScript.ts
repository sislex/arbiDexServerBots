import type { IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script, IPool } from '../../store/state.types';
import type { DexQuotesByArbQuoterScriptResult } from './helpers/types';
import {runDeployedImpactQuoteTestEther} from './helpers/runDeployedImpactQuoteTestEther.ts';
import type {DeployedImpactQuoteStabsConfig} from './helpers/configQuoteInput.ts';

export async function getDexQuotesByArbQuoterScript(
  params: IJobParams_get_Dex_Quotes_By_Arb_Quoter_Script,
  opts?: { humanReadable?: boolean },
): Promise<DexQuotesByArbQuoterScriptResult> {

  const result = await runDeployedImpactQuoteTestEther({
    networkEnvPrefix: "ARBITRUM",
    config: params as DeployedImpactQuoteStabsConfig,
  }).catch((e) => {
    console.error("Quote script failed:", e);
    process.exitCode = 1;
  });

  return result;
}

