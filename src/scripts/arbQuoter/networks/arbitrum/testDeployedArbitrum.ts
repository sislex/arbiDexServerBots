import {
  runDeployedImpactQuoteTest,
  type DeployedImpactQuoteStabsConfig,
} from "../helpers/runDeployedImpactQuoteTest";
import { ArbitrumPoolsConfigListStabs } from "./arbitrumPoolsConfigList.stabs";

runDeployedImpactQuoteTest({
  networkName: "Arbitrum",
  quoterEnvKey: "ARBITRUM_QUOTER_ADDRESS",
  configName: "ArbitrumPoolsConfigListStabs",
  config: ArbitrumPoolsConfigListStabs as DeployedImpactQuoteStabsConfig,
}).catch((e) => {
  console.error("Quote script failed:", e);
  process.exitCode = 1;
});
