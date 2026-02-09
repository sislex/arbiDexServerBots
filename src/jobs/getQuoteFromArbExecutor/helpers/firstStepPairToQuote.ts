import {IQuote, ZERO_ADDRESS} from '../../../store/state.types';

export const getFirstStepPairToQuote = () => {
  const firstStepPairToQuote: IQuote = {
    dex: 'uniswap',
    version: 'v2',
    token0: {
      address: ZERO_ADDRESS,
      decimals: 18
    },
    token1: {
      address: ZERO_ADDRESS,
      decimals: 18
    },
    poolAddress: ZERO_ADDRESS,
    feePpm: 3000,
    tokenIn: {
      address: ZERO_ADDRESS,
      decimals: 18
    },
    tokenOut: {
      address: ZERO_ADDRESS,
      decimals: 18
    },
    side: 'exactIn',
    amount: '3000000000000000',
    blockTag: 'latest',
    quoteSource: 'uniswap-v2-router'
  };

  return firstStepPairToQuote;
}
