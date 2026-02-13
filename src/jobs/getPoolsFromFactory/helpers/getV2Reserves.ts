import { Injectable } from '@nestjs/common';
import { createPublicClient, http, parseAbi } from 'viem';
import { arbitrum } from 'viem/chains';

const V2_POOL_ABI = parseAbi([
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function stableSwap() view returns (bool)',
]);

@Injectable()
export class GetV2ReservesHelper {
  private client = createPublicClient({
    chain: arbitrum,
    transport: http(
      'https://arb-mainnet.g.alchemy.com/v2/TxHI6ptndQEJi3coISt0BcQZdZg1rnWV',
      {
        batch: true,
      },
    ),
  });

  async getV2Reserves(address: `0x${string}`) {
    console.log(`getV2Reserves from address: ${address}`);
    const contracts = [
      { address, abi: V2_POOL_ABI, functionName: 'getReserves' },
      { address, abi: V2_POOL_ABI, functionName: 'token0' },
      { address, abi: V2_POOL_ABI, functionName: 'token1' },
    ];

    const results = await this.client.multicall({
      contracts,
      allowFailure: true,
    });

    const reserves = results[0].result as any;
    const token0 = results[1].result as string;
    const token1 = results[2].result as string;

    if (!reserves) return null;

    return {
      address,
      token0,
      token1,
      reserve0: reserves[0].toString(),
      reserve1: reserves[1].toString(),
    };
  }
}
