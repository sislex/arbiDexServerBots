import {
  IJobParams,
  IJobParams_get_Arbitrum_UniswapV3_Quote, IJobParams_get_Arbitrum_UniswapV3_Quote_Multi,
  IJobParams_get_Pool_State,
  IJobType
} from '../store/state.types';
import {
  get_Arbitrum_UniswapV3_Quote,
  QuoteExactInputSingleRaw, QuoteExactOutputSingleRaw
} from './getQuote_Arbitrum_UniswapV3/arbitrum.uniswap-v3.quote';
import {getPoolState} from './getPoolState/getPoolState';
import {PoolState} from './getPoolState/getPoolState.types';
import {get_Arbitrum_UniswapV3_Quote_Multi} from './getQuote_Arbitrum_UniswapV3_Multi/arbitrum.uniswap-v3-multi.quote';


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
  [IJobType.GET_ARBITRUM_UNISWAP_V3_QUOTES_MULTI]:
    async (params: IJobParams_get_Arbitrum_UniswapV3_Quote_Multi): Promise<QuoteResult> => get_Arbitrum_UniswapV3_Quote_Multi(params),

  // [IJobType.GET_ARBITRUM_UNISWAP_V2_QUOTES]:
  //   async (params: IJobParams_ArbitrumUniswapV2Quotes): Promise<QuoteResult> =>
  //     get_Arbitrum_UniswapV2_Quote(params),
} as const;

// Единая точка входа
export async function runJob(params: IJobParams): Promise<QuoteResult> {
  const fn = handlers[params.jobType] as (p: typeof params) => Promise<QuoteResult>;
  if (!fn) throw new Error(`No handler for jobType=${params.jobType}`);
  return fn(params);
}
