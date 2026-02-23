import { getPoolsFromFactory } from './getPoolsFromFactory';
import { runWithContext } from './utils/run-with-context';

export async function getNewDexPoolsFromFactory(deps: {
  jobType: string;
  rpcUrl: string;
  pairsToQuote: any;
  extraSettings?: string;
}) {
  // 1. Заходим в контекст, чтобы один раз узнать текущий блок из БД
  await runWithContext(
    deps.extraSettings,
    async ({ manager, services, configData }) => {
      const lastBlock =
        (
          await services.lastBlock.findOneByVersionAndDex(
            configData.version,
            configData.dexId,
            manager,
          )
        )?.blockNumber || 1;

      // 2. Парсим и патчим настройки
      const settings = JSON.parse(deps.extraSettings || '{}');
      settings.configData.start = lastBlock;
      settings.configData.finish = lastBlock + 1000;

      // 3. Вызываем основную функцию с обновленным JSON
      console.log('---START?---', settings)
      await getPoolsFromFactory({
        ...deps,
        extraSettings: JSON.stringify(settings),
      });
    },
  );
}
