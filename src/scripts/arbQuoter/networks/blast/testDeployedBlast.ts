import {
  runDeployedImpactQuoteTest,
  type DeployedImpactQuoteStabsConfig,
} from "../helpers/runDeployedImpactQuoteTest";
import { BlastPoolsConfigListStabs } from "./blastPoolsConfigList.stabs";

runDeployedImpactQuoteTest({
  networkName: "Blast",
  quoterEnvKey: "BLAST_QUOTER_ADDRESS",
  configName: "BlastPoolsConfigListStabs",
  config: BlastPoolsConfigListStabs as DeployedImpactQuoteStabsConfig,
}).catch((e) => {
  console.error("Quote script failed:", e);
  process.exitCode = 1;
});
