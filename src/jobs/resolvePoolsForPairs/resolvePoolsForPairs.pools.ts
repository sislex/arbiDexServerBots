import {
  IJobParams_resolve_Pools_For_Pairs,
  IPairToQuote
} from '../../store/state.types';
import {ethers} from 'ethers';
import {resolveUniswapV3PoolAddress} from './resolveUniswapV3PoolAddress.pools';

export async function resolvePoolsForPairs(
  params: IJobParams_resolve_Pools_For_Pairs
): Promise<any[]> {
  const {
    pairsToQuote,
    rpcUrl = "https://arb1.arbitrum.io/rpc",
  } = params;
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return Promise.all(
    pairsToQuote.map(async (pair) => {
      if (pair.poolAddress) return pair;

      if (
        pair.quoteSource === 'uniswap-v3-quoter-v2' &&
        pair.dex === 'uniswap' &&
        pair.version === 'v3'
      ) {
        const poolAddress = await resolveUniswapV3PoolAddress(pair, provider);

        return {
          ...pair,
          poolAddress,
        };
      }

      return pair;
    })
  );
}
