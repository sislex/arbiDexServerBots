import { ArbitrumPoolsConfigListStabs } from './arbitrumPoolsConfigList.stabs';
import { runDeployedImpactQuoteTest } from '../helpers/runDeployedImpactQuoteTest';

runDeployedImpactQuoteTest({
  networkName: 'Arbitrum',
  envPrefix: 'ARBITRUM',
  configName: 'ArbitrumPoolsConfigListStabs',
  config: ArbitrumPoolsConfigListStabs,
}).catch((e) => {
  console.error('Quote script failed:', e);
  process.exitCode = 1;
});



