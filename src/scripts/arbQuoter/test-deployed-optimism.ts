import { OptimismPoolsConfigListStabs } from './configs/optimism.config';
import { runDeployedImpactQuoteTest } from './helpers/runDeployedImpactQuoteTest';

runDeployedImpactQuoteTest({
  networkName: 'Optimism',
  envPrefix: 'OPTIMISM',
  configName: 'OptimismPoolsConfigListStabs',
  config: OptimismPoolsConfigListStabs,
}).catch((e) => {
  console.error('Quote script failed:', e);
  process.exitCode = 1;
});

