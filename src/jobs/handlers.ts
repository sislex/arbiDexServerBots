import {IJobParams, IJobParams_get_Arbitrum_UniswapV3_Quote, IJobType} from '../store/state.types';
import {
  get_Arbitrum_UniswapV3_Quote,
  QuoteExactInputSingleRaw, QuoteExactOutputSingleRaw
} from './getQuote_Arbitrum_UniswapV3/arbitrum.uniswap-v3.quote';


export interface QuoteResult {
  ok: boolean;
  latencyMs?: number;

  result?: {
    quoteExactInputSingle: QuoteExactInputSingleRaw;
    quoteExactOutputSingle?: QuoteExactOutputSingleRaw;
  };
  blockNumber?: number;

  error?: string;
  message?: string;
}

// Регистрируем хендлеры: каждый принимает *ровно те же params*, что пришли в раннер
const handlers = {
  [IJobType.GET_ARBITRUM_UNISWAP_V3_QUOTES]:
    async (params: IJobParams_get_Arbitrum_UniswapV3_Quote): Promise<QuoteResult> =>
      get_Arbitrum_UniswapV3_Quote(params),

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
