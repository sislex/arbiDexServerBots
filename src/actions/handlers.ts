import {IActionParams, IActionParams_get_Arbitrum_UniswapV3_Quote, IActionType} from '../store/state.types';
import {get_Arbitrum_UniswapV3_Quote} from './getQuote_Arbitrum_UniswapV3/arbitrum.uniswap-v3.quote';


export interface QuoteResult {
  ok: boolean;
  amountOut?: bigint;
  errorMessage?: string;
}

// Регистрируем хендлеры: каждый принимает *ровно те же params*, что пришли в раннер
const handlers = {
  [IActionType.GET_ARBITRUM_UNISWAP_V3_QUOTES]:
    async (params: IActionParams_get_Arbitrum_UniswapV3_Quote): Promise<QuoteResult> =>
      get_Arbitrum_UniswapV3_Quote(params),

  // [IActionType.GET_ARBITRUM_UNISWAP_V2_QUOTES]:
  //   async (params: IActionParams_ArbitrumUniswapV2Quotes): Promise<QuoteResult> =>
  //     get_Arbitrum_UniswapV2_Quote(params),
} as const;

// Единая точка входа
export async function runAction(params: IActionParams): Promise<QuoteResult> {
  const fn = handlers[params.actionType] as (p: typeof params) => Promise<QuoteResult>;
  if (!fn) throw new Error(`No handler for actionType=${params.actionType}`);
  return fn(params);
}
