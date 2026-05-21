import "dotenv/config";
import {
  runDeployedImpactQuoteTestEther,
  type DeployedImpactQuoteStabsConfig,
} from "../helpers/runDeployedImpactQuoteTestEther.ts";
import { OptimismPoolsConfigListStabs } from "./optimismPoolsConfigList.stabs.ts";

runDeployedImpactQuoteTestEther({
  networkName: "Optimism",
  networkEnvPrefix: "OPTIMISM",
  quoterEnvKey: "OPTIMISM_QUOTER_ADDRESS",
  configName: "OptimismPoolsConfigListStabs",
  config: OptimismPoolsConfigListStabs as DeployedImpactQuoteStabsConfig,
  rpcUrl: process.env.OPTIMISM_RPC || OptimismPoolsConfigListStabs.rpcUrl,
}).catch((e) => {
  console.error("Quote script failed:", e);
  process.exitCode = 1;
});

