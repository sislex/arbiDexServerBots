import { ethers } from 'ethers';
import {UNISWAP_V3_FACTORY, UNISWAP_V3_FACTORY_ABI} from '../../helpers/dex.constants';
import {IPairToQuote} from '../../store/state.types';

export async function resolveUniswapV3PoolAddress(
  pair: IPairToQuote,
  provider: ethers.Provider
): Promise<string | undefined> {

  if (pair.dex !== 'uniswap' || pair.version !== 'v3') {
    throw new Error('Unsupported pair for Uniswap V3 pool resolve');
  }

  const factory = new ethers.Contract(
    UNISWAP_V3_FACTORY,
    UNISWAP_V3_FACTORY_ABI,
    provider
  );

  const pool: string = await factory.getPool(
    pair.tokenIn.address,
    pair.tokenOut.address,
    pair.feePpm
  );

  // Если пула не существует → address(0)
  if (pool === ethers.ZeroAddress) {
    return undefined;
  }

  return pool;
}
