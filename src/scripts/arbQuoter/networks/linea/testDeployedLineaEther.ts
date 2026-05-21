import "dotenv/config";
import {
  runDeployedImpactQuoteTestEther,
  type DeployedImpactQuoteStabsConfig,
} from "../helpers/runDeployedImpactQuoteTestEther.ts";
import { LineaPoolsConfigListStabs } from "./lineaPoolsConfigList.stabs.ts";

runDeployedImpactQuoteTestEther({
  networkName: "Linea",
  networkEnvPrefix: "LINEA",
  quoterEnvKey: "LINEA_QUOTER_ADDRESS",
  configName: "LineaPoolsConfigListStabs",
  config: LineaPoolsConfigListStabs as DeployedImpactQuoteStabsConfig,
  rpcUrl: process.env.LINEA_RPC || LineaPoolsConfigListStabs.rpcUrl,
}).catch((e) => {
  console.error("Quote script failed:", e);
  process.exitCode = 1;
});

