import {
  runDeployedImpactQuoteTest,
  type DeployedImpactQuoteStabsConfig,
} from "../helpers/runDeployedImpactQuoteTest";
import { OptimismPoolsConfigListStabs } from "./optimismPoolsConfigList.stabs";

runDeployedImpactQuoteTest({
  networkName: "Optimism",
  quoterEnvKey: "OPTIMISM_QUOTER_ADDRESS",
  configName: "OptimismPoolsConfigListStabs",
  config: OptimismPoolsConfigListStabs as DeployedImpactQuoteStabsConfig,
}).catch((e) => {
  console.error("Quote script failed:", e);
  process.exitCode = 1;
});
