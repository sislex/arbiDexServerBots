import { Injectable } from '@nestjs/common';
import { Chain, createPublicClient, http, parseAbi } from 'viem';
import { arbitrum } from 'viem/chains';
import { getBlockchainClient } from './blockchain-client.factory';

const V2_POOL_ABI = parseAbi([
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function stableSwap() view returns (bool)',
]);

@Injectable()
export class GetV2ReservesHelper {
  // private client = createPublicClient({
  //   chain: arbitrum,
  //   transport: http(
  //     'https://arb-mainnet.g.alchemy.com/v2/TxHI6ptndQEJi3coISt0BcQZdZg1rnWV',
  //     {
  //       batch: true,
  //     },
  //   ),
  // });

  async getV2Reserves(chain: number, addresses: `0x${string}`[]) {
    const client = getBlockchainClient(chain);

    const contracts = addresses.flatMap((address) => [
      { address, abi: V2_POOL_ABI, functionName: 'getReserves' },
      { address, abi: V2_POOL_ABI, functionName: 'token0' },
      { address, abi: V2_POOL_ABI, functionName: 'token1' },
    ]);

    const results = await client.multicall({
      contracts,
      allowFailure: true,
    });

    console.log('---[addresses]', addresses);

    return addresses.map((address, index) => {
      const offset = index * 3;

      const reservesRes = results[offset];
      const t0Res = results[offset + 1];
      const t1Res = results[offset + 2];

      if (reservesRes.status === 'failure') {
        console.error(`Failed reserves for ${address}`);
        return null;
      }

      const reserves = reservesRes.result as [bigint, bigint, number];
      const token0 = t0Res.result as `0x${string}`;
      const token1 = t1Res.result as `0x${string}`;

      if (!reserves || !token0 || !token1) return null;

      return {
        address,
        token0,
        token1,
        reserve0: reserves[0].toString(),
        reserve1: reserves[1].toString(),
      };
    }).filter(Boolean);
  }
}
