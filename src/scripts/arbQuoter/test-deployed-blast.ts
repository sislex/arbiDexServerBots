import { BlastPoolsConfigListStabs } from './configs/blast.config';
import { runDeployedImpactQuoteTest } from './helpers/runDeployedImpactQuoteTest';

runDeployedImpactQuoteTest({
  networkName: 'Blast',
  envPrefix: 'BLAST',
  configName: 'BlastPoolsConfigListStabs',
  config: BlastPoolsConfigListStabs,
}).catch((e) => {
  console.error('Quote script failed:', e);
  process.exitCode = 1;
});

