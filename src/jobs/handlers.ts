import {
  IJobParams,
  IJobParams_get_Arbitrum_UniswapV3_Quote, IJobParams_get_Arbitrum_Quote_Multi,
  IJobParams_get_Pool_State,
  IJobType, IJobParams_resolve_Pools_For_Pairs, IPairToQuote
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
} as const;

// Единая точка входа
export async function runJob(params: IJobParams): Promise<QuoteResult> {
  const fn = handlers[params.jobType] as (p: typeof params) => Promise<QuoteResult>;
  if (!fn) throw new Error(`No handler for jobType=${params.jobType}`);
  return fn(params);
}
