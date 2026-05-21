import "dotenv/config";
import {
  runDeployedImpactQuoteTestEther,
  type DeployedImpactQuoteStabsConfig,
} from "../helpers/runDeployedImpactQuoteTestEther.ts";
import { BasePoolsConfigListStabs } from "./basePoolsConfigList.stabs.ts";

runDeployedImpactQuoteTestEther({
  networkName: "Base",
  networkEnvPrefix: "BASE",
  quoterEnvKey: "BASE_QUOTER_ADDRESS",
  configName: "BasePoolsConfigListStabs",
  config: BasePoolsConfigListStabs as DeployedImpactQuoteStabsConfig,
  rpcUrl: process.env.BASE_RPC || BasePoolsConfigListStabs.rpcUrl,
}).catch((e) => {
  console.error("Quote script failed:", e);
  process.exitCode = 1;
});

