import { BasePoolsConfigListStabs } from './configs/base.config';
import { runDeployedImpactQuoteTest } from './helpers/runDeployedImpactQuoteTest';

runDeployedImpactQuoteTest({
  networkName: 'Base',
  envPrefix: 'BASE',
  configName: 'BasePoolsConfigListStabs',
  config: BasePoolsConfigListStabs,
}).catch((e) => {
  console.error('Quote script failed:', e);
  process.exitCode = 1;
});

