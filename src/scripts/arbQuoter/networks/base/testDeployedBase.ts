import {
  runDeployedImpactQuoteTest,
  type DeployedImpactQuoteStabsConfig,
} from "../helpers/runDeployedImpactQuoteTest";
import { BasePoolsConfigListStabs } from "./basePoolsConfigList.stabs";

runDeployedImpactQuoteTest({
  networkName: "Base",
  quoterEnvKey: "BASE_QUOTER_ADDRESS",
  configName: "BasePoolsConfigListStabs",
  config: BasePoolsConfigListStabs as DeployedImpactQuoteStabsConfig,
}).catch((e) => {
  console.error("Quote script failed:", e);
  process.exitCode = 1;
});
