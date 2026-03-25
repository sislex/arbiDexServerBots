import {
  IJobParams,
  IJobParams_get_Arbitrum_UniswapV3_Quote,
  IJobParams_get_Arbitrum_Quote_Multi,
  IJobParams_get_Pool_State,
  IJobType,
  IJobParams_resolve_Pools_For_Pairs,
  IPairToQuote,
  IJobParams_get_Arbitrum_Arb_Executor_Quotes,
  IJobParams_get_Pools_From_Factory,
  IJobParams_get_Pools_Reserves,
  IJobParams_get_New_Dex_Pools_Reserves,
  IJobParams_get_Executor_Balances, IJobParams_set_Quotes_Graph_Data, IJobParams_get_Best_Sell_Quotes, IJobParams_get_Dex_Quotes_By_Arb_Quoter
} from '../store/state.types';
import {
  get_Arbitrum_UniswapV3_Quote,
  QuoteExactInputSingleRaw, QuoteExactOutputSingleRaw
} from './getQuote_Arbitrum_UniswapV3/arbitrum.uniswap-v3.quote';
import {getPoolState} from './getPoolState/getPoolState';
import {PoolState} from './getPoolState/getPoolState.types';
import {get_Arbitrum_Quote_Multi} from './getQuote_Arbitrum_Multi/arbitrum-multi.quote';
import {get_Arbitrum_UniswapV2_Quote_NoMulticall} from './getQuote_Arbitrum_Uni_v2/arbitrum-multi.quote';
import {resolvePoolsForPairs} from './resolvePoolsForPairs/resolvePoolsForPairs.pools';
import {getArbExecutorQuotes} from './getQuoteFromArbExecutor/getArbExecutor.quotes';
import { getPoolsFromFactory } from './getPoolsFromFactory/getPoolsFromFactory';
import { getPoolsReserves } from './getPoolsReserves/getPoolsReserves';
import { getNewDexPoolsFromFactory } from './getPoolsFromFactory/getNewDexPoolsFromFactory';
import { getExecutorBalances } from './getExecutorBalances/getExecutorBalances';
import {getDexQuotesByArbQuoter} from './getDexQuotesByArbQuoter/getDexQuotesByArbQuoter';
import { setQuotesGraphData } from './setQuotesGraphData/createRandomDataForGraph';

// базовый результат для всех квот
export interface BaseQuoteResult {
  ok: boolean;
  latencyMs?: number;
  error?: string;
  message?: string;
  blockNumber?: number;
}

// Single-quote (старый вариант) – оставляем как есть, но на базе BaseQuoteResult
export interface QuoteResult extends BaseQuoteResult {
  result?: {
    quoteExactInputSingle: QuoteExactInputSingleRaw;
    quoteExactOutputSingle?: QuoteExactOutputSingleRaw;
  };
}

export interface ResolvePoolsResult {
  ok: boolean;
  latencyMs: number;
  result: IPairToQuote[];
  errors?: { message: string }[];
}

// Generic-мультирезультат
export interface QuoteResultMulti<T = any> extends BaseQuoteResult {
  result?: T;
}

// Регистрируем хендлеры: каждый принимает *ровно те же params*, что пришли в раннер
const handlers = {
  [IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER]:
    async (params: IJobParams_get_Dex_Quotes_By_Arb_Quoter): Promise<QuoteResult> => getDexQuotesByArbQuoter(params),
  [IJobType.GET_ARB_EXECUTOR_QUOTES]:
    async (params: IJobParams_get_Arbitrum_Arb_Executor_Quotes): Promise<QuoteResult> => getArbExecutorQuotes(params),
  [IJobType.GET_POOL_STATE]:
    async (params: IJobParams_get_Pool_State): Promise<PoolState> => getPoolState(params),
  [IJobType.GET_ARBITRUM_UNISWAP_V3_QUOTES]:
    async (params: IJobParams_get_Arbitrum_UniswapV3_Quote): Promise<QuoteResult> => get_Arbitrum_UniswapV3_Quote(params),
  [IJobType.GET_ARBITRUM_QUOTES_MULTI]:
    async (params: IJobParams_get_Arbitrum_Quote_Multi): Promise<QuoteResult> => get_Arbitrum_Quote_Multi(params),

  [IJobType.GET_ARBITRUM_UNISWAP_V2_QUOTES]:
    async (params: IJobParams_get_Arbitrum_Quote_Multi): Promise<QuoteResult> =>
      get_Arbitrum_UniswapV2_Quote_NoMulticall(params),

  [IJobType.RESOLVE_POOLS_FOR_PAIRS]:
    async (params: IJobParams_resolve_Pools_For_Pairs): Promise<any[]> =>
      resolvePoolsForPairs(params),

  [IJobType.GET_POOLS_FROM_FACTORY]:
    async (params: IJobParams_get_Pools_From_Factory): Promise<any> =>
      getPoolsFromFactory(params),

  [IJobType.GET_POOLS_RESERVES]:
    async (params: IJobParams_get_Pools_Reserves): Promise<any> =>
      getPoolsReserves(params),

  [IJobType.GET_NEW_DEX_POOLS_RESERVES]:
    async (params: IJobParams_get_New_Dex_Pools_Reserves): Promise<any> =>
      getNewDexPoolsFromFactory(params),

  [IJobType.GET_EXECUTOR_BALANCES]:
    async (params: IJobParams_get_Executor_Balances): Promise<any> =>
      getExecutorBalances(params),

  [IJobType.SET_QUOTES_GRAPH_DATA]:
    async (params: IJobParams_set_Quotes_Graph_Data): Promise<any> =>
      setQuotesGraphData(params),
} as const;

// Единая точка входа
export async function runJob(params: IJobParams): Promise<QuoteResult> {
  const fn = handlers[params.jobType] as (p: typeof params) => Promise<QuoteResult>;
  if (!fn) throw new Error(`No handler for jobType=${params.jobType}`);
  return fn(params);
}
