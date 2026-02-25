import { getPoolsFromFactory } from './getPoolsFromFactory';
import { runWithContext } from './utils/run-with-context';

export async function getNewDexPoolsFromFactory(deps: {
  jobType: string;
  rpcUrl: string;
  pairsToQuote: any;
  extraSettings?: string;
}) {
  await runWithContext(
    deps.extraSettings,
    async ({ manager, services, configData }) => {
      const lastBlock =
        (
          await services.lastBlock.findOneByVersionAndDex(
            configData.version,
            configData.dexId,
            configData.chainId,
            manager,
          )
        )?.blockNumber || 1;

      const settings = JSON.parse(deps.extraSettings || '{}');
      settings.configData.start = lastBlock;
      settings.configData.finish = lastBlock + settings.configData.plus;

      await getPoolsFromFactory({
        ...deps,
        extraSettings: JSON.stringify(settings),
      });
    },
  );
}
