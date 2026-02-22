import { DataSource, DataSourceOptions, EntityManager } from 'typeorm';
import { TokensService } from '../helpers/tokens/tokens.service';
import { ChainsService } from '../helpers/chains/chains.service';
import { DexesService } from '../helpers/dexes/dexes.service';
import { LastBlockNumberDexService } from '../helpers/lastBlockNumberDex/lastBlockNumberDex.service';
import { PoolsService } from '../helpers/pools/pools.service';
import { DBConnector } from '../dbConnector';
import {
  Chains,
  Dexes,
  LastBlockNumberDex,
  Pools,
  Tokens,
} from '../helpers/entities/entities';

interface JobContext {
  manager: EntityManager;
  configData: any;
  services: {
    tokens: TokensService;
    chains: ChainsService;
    dexes: DexesService;
    pools: PoolsService;
    lastBlock: LastBlockNumberDexService;
  };
}

export async function runWithContext(
  extraSettings: string | undefined,
  callback: (ctx: JobContext) => Promise<any>,
) {
  let parsedSettings: any;
  try {
    parsedSettings =
      typeof extraSettings === 'string'
        ? JSON.parse(extraSettings)
        : extraSettings;
    if (!parsedSettings?.configData || !parsedSettings?.configDB) {
      throw new Error('Missing configData or configDB');
    }
  } catch (e) {
    console.error('!!! Invalid extraSettings JSON', e.message);
    return { success: false, error: 'Invalid extraSettings JSON' };
  }

  const { configData, configDB } = parsedSettings;
  let dataSource: DataSource | undefined;

  try {
    dataSource = await DBConnector.create(configDB as DataSourceOptions);
    const manager = dataSource.manager;

    const tokens = new TokensService(
      manager.getRepository(Tokens),
      manager.getRepository(Chains),
    );
    const chains = new ChainsService(manager.getRepository(Chains));
    const dexes = new DexesService(manager.getRepository(Dexes));
    const pools = new PoolsService(
      manager.getRepository(Pools),
      tokens,
      chains,
      dexes,
    );
    const lastBlock = new LastBlockNumberDexService(
      manager.getRepository(LastBlockNumberDex),
    );

    return await callback({
      manager,
      configData,
      services: { tokens, chains, dexes, pools, lastBlock },
    });
  } catch (error) {
    console.error('!!! EXECUTION ERROR:', error.message);
    throw error;
  } finally {
    if (dataSource) {
      await DBConnector.close(dataSource);
      console.debug('--- [FINALLY] Connection closed. ---');
    }
  }
}
