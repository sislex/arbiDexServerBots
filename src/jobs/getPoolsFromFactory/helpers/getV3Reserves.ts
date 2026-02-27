import { Injectable } from '@nestjs/common';
import { Chain, createPublicClient, http, parseAbi } from 'viem';
import { arbitrum } from 'viem/chains';
import { getBlockchainClient } from './blockchain-client.factory';

const V3_POOL_ABI = parseAbi([
  'function slot0() view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)',
  'function liquidity() view returns (uint128)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
]);

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

@Injectable()
export class GetV3ReservesHelper {
  // private client = createPublicClient({
  //   chain: arbitrum,
  //   transport: http(
  //     'https://arb-mainnet.g.alchemy.com/v2/TxHI6ptndQEJi3coISt0BcQZdZg1rnWV',
  //     {
  //       batch: true,
  //     },
  //   ),
  // });

  async getV3Reserves(chain: number, poolAddresses: `0x${string}`[]) {
    const client = getBlockchainClient(chain);

    try {
      const tokenCalls = poolAddresses.flatMap((address) => [
        { address, abi: V3_POOL_ABI, functionName: 'token0' },
        { address, abi: V3_POOL_ABI, functionName: 'token1' },
      ]);

      const tokenResults = await client.multicall({
        contracts: tokenCalls,
        allowFailure: true,
      });

      const balanceCalls: any[] = [];
      const validPools: any[] = [];

      poolAddresses.forEach((address, i) => {
        const token0 = tokenResults[i * 2]?.result as `0x${string}`;
        const token1 = tokenResults[i * 2 + 1]?.result as `0x${string}`;

        if (token0 && token1) {
          validPools.push({ address, token0, token1 });
          balanceCalls.push(
            { address: token0, abi: ERC20_ABI, functionName: 'balanceOf', args: [address] },
            { address: token1, abi: ERC20_ABI, functionName: 'balanceOf', args: [address] }
          );
        }
      });

      const balanceResults = await client.multicall({
        contracts: balanceCalls,
        allowFailure: true,
      });

      return validPools.map((pool, i) => {
        const reserve0 = balanceResults[i * 2]?.result as bigint;
        const reserve1 = balanceResults[i * 2 + 1]?.result as bigint;

        if (reserve0 === undefined || reserve1 === undefined) return null;

        return {
          address: pool.address,
          token0: pool.token0,
          token1: pool.token1,
          reserve0: reserve0.toString(),
          reserve1: reserve1.toString(),
        };
      }).filter(Boolean);

    } catch (error) {
      console.error('Multicall V3 error:', error);
      return [];
    }
  }

  // async getPoolTokens(address: `0x${string}`): Promise<{
  //   token0: `0x${string}`;
  //   token1: `0x${string}`;
  // } | null> {
  //   try {
  //     const [token0, token1] = (await client.multicall({
  //       contracts: [
  //         {
  //           address,
  //           abi: V3_POOL_ABI,
  //           functionName: 'token0',
  //         },
  //         {
  //           address,
  //           abi: V3_POOL_ABI,
  //           functionName: 'token1',
  //         },
  //       ],
  //       allowFailure: false,
  //     })) as readonly [`0x${string}`, `0x${string}`];
  //
  //     return { token0, token1 };
  //   } catch (error) {
  //     console.error(`Error getting tokens for the pool ${address}:`, error);
  //     return null;
  //   }
  // }
  //
  // async getTokenBalances(
  //   token0: `0x${string}`,
  //   token1: `0x${string}`,
  //   poolAddress: `0x${string}`,
  // ): Promise<{ reserve0: bigint; reserve1: bigint } | null> {
  //   try {
  //     const [reserve0, reserve1] = (await client.multicall({
  //       contracts: [
  //         {
  //           address: token0,
  //           abi: ERC20_ABI,
  //           functionName: 'balanceOf',
  //           args: [poolAddress],
  //         },
  //         {
  //           address: token1,
  //           abi: ERC20_ABI,
  //           functionName: 'balanceOf',
  //           args: [poolAddress],
  //         },
  //       ],
  //       allowFailure: false,
  //     })) as readonly [bigint, bigint];
  //
  //     return {
  //       reserve0,
  //       reserve1,
  //     };
  //   } catch (error) {
  //     console.error(
  //       `Error retrieving balances for tokens ${token0}, ${token1}:`,
  //       error,
  //     );
  //     return null;
  //   }
  // }
}
