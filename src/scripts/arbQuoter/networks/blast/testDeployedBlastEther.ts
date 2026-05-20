import "dotenv/config";
import {
  runDeployedImpactQuoteTestEther,
  type DeployedImpactQuoteStabsConfig,
} from "../helpers/runDeployedImpactQuoteTestEther.ts";
import { BlastPoolsConfigListStabs } from "./blastPoolsConfigList.stabs.ts";

runDeployedImpactQuoteTestEther({
  networkName: "Blast",
  networkEnvPrefix: "BLAST",
  quoterEnvKey: "BLAST_QUOTER_ADDRESS",
  configName: "BlastPoolsConfigListStabs",
  config: BlastPoolsConfigListStabs as DeployedImpactQuoteStabsConfig,
  rpcUrl: process.env.BLAST_RPC || BlastPoolsConfigListStabs.rpcUrl,
}).catch((e) => {
  console.error("Quote script failed:", e);
  process.exitCode = 1;
});

