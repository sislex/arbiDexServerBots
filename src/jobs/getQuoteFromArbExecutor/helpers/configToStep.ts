import {Address, IContractStep, IQuote, SwapKind} from '../../../store/state.types';
import {v2RouterOf} from '../../../helpers/v2RouterOf.helper';
import {ZeroAddress} from 'ethers';
import {V2_DEXES} from '../../../helpers/dex.constants';

export const configToStep = (quote: IQuote): IContractStep => {
  if (quote.side !== 'exactIn') {
    throw new Error(`configToStep: only exactIn supported, got "${quote.side}"`);
  }

  const isV2 = quote.version === 'v2';

  let kind: number  = SwapKind.V3_POOL_EXACT_IN;
  if (isV2) {
    kind = SwapKind.V2_EXACT_IN;
  }

  let path: Address[]  = [];
  if (isV2) {
    path = [quote.tokenIn.address, quote.tokenOut.address];
  }

  let pool: Address  = quote.poolAddress as Address;
  if (isV2) {
    pool = (ZeroAddress as Address);
  }

  let router: Address  = (ZeroAddress as Address);
  if (isV2) {
    router = v2RouterOf(quote.dex, V2_DEXES);
  }

  return {
    // 👇 ВАЖНО: правильный SwapKind
    kind,

    // ===== routing =====
    router,
    path,
    pool,

    // ===== tokens =====
    tokenIn: quote.tokenIn.address as Address,
    tokenOut: quote.tokenOut.address as Address,

    // ===== amounts =====
    amountIn: BigInt(quote.amount),
    amountOutMin: quote.amountOutMin ? quote.amountOutMin : 0n,

    // ===== V3 only =====
    sqrtPriceLimitX96: 0,

    deadline: 0,
  };
};
