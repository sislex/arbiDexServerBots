import "dotenv/config";
import {
  runDeployedImpactQuoteTestEther,
  type DeployedImpactQuoteStabsConfig,
} from "../helpers/runDeployedImpactQuoteTestEther";
import { ArbitrumPoolsConfigListStabs } from "./arbitrumPoolsConfigList.stabs";

runDeployedImpactQuoteTestEther({
  networkName: "Arbitrum",
  networkEnvPrefix: "ARBITRUM",
  quoterEnvKey: "ARBITRUM_QUOTER_ADDRESS",
  configName: "ArbitrumPoolsConfigListStabs",
  config: ArbitrumPoolsConfigListStabs as DeployedImpactQuoteStabsConfig,
  rpcUrl: process.env.ARBITRUM_RPC || ArbitrumPoolsConfigListStabs.rpcUrl,
}).catch((e) => {
  console.error("Quote script failed:", e);
  process.exitCode = 1;
});








