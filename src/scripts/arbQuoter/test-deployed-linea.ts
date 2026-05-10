import { LineaPoolsConfigListStabs } from './configs/linea.config';
import { runDeployedImpactQuoteTest } from './helpers/runDeployedImpactQuoteTest';

runDeployedImpactQuoteTest({
  networkName: 'Linea',
  envPrefix: 'LINEA',
  configName: 'LineaPoolsConfigListStabs',
  config: LineaPoolsConfigListStabs,
}).catch((e) => {
  console.error('Quote script failed:', e);
  process.exitCode = 1;
});

