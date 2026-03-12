import { EntityManager } from 'typeorm';
import { TokensService } from '../helpers/tokens/tokens.service';
import { ChainsService } from '../helpers/chains/chains.service';
import { DexesService } from '../helpers/dexes/dexes.service';
import { LastBlockNumberDexService } from '../helpers/lastBlockNumberDex/lastBlockNumberDex.service';
import { PoolsService } from '../helpers/pools/pools.service';
import {
  Chains,
  Dexes,
  LastBlockNumberDex,
  Pools,
  Tokens,
} from '../helpers/entities/entities';
import { QuotesGraphService } from '../../setQuotesGraphData/helpers/quotes_graph/quotes_graph.service';
import { QuotesGraph } from '../../setQuotesGraphData/helpers/entities/entities/QuotesGraph';

export const initServices = (manager: EntityManager) => {
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
  const quotesGraph = new QuotesGraphService(
    manager.getRepository(QuotesGraph),
  );
  const lastBlock = new LastBlockNumberDexService(
    manager.getRepository(LastBlockNumberDex),
  );

  return { tokens, chains, dexes, pools, lastBlock, quotesGraph };
};
