import {
  runDeployedImpactQuoteTest,
  type DeployedImpactQuoteStabsConfig,
} from "../helpers/runDeployedImpactQuoteTest";
import { LineaPoolsConfigListStabs } from "./lineaPoolsConfigList.stabs";

runDeployedImpactQuoteTest({
  networkName: "Linea",
  quoterEnvKey: "LINEA_QUOTER_ADDRESS",
  configName: "LineaPoolsConfigListStabs",
  config: LineaPoolsConfigListStabs as DeployedImpactQuoteStabsConfig,
}).catch((e) => {
  console.error("Quote script failed:", e);
  process.exitCode = 1;
});
