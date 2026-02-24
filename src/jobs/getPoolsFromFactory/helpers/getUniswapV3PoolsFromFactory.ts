import { ethers } from 'ethers';
export const ARBISCAN_RPC = 'https://arb1.arbitrum.io/rpc';

const v3FactoryIface = new ethers.Interface([
  'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
]);

export async function getUniswapV3PoolsFromFactory(
  factoryAddress: string,
  fromBlock = 0,
  toBlock?: number,
) {
  const provider = new ethers.JsonRpcProvider(ARBISCAN_RPC);
  const factory = ethers.getAddress(factoryAddress.toLowerCase());
  const latest = await provider.getBlockNumber();
  const endBlock = toBlock ?? latest;
  console.log('===latest===', latest);
  const topic0 = ethers.id('PoolCreated(address,address,uint24,int24,address)');
  const step = 100_000;

  const pools: any[] = [];

  let lastProcessedBlock = fromBlock;

  for (let start = fromBlock; start <= endBlock; start += step + 1) {
    const end = Math.min(endBlock, start + step);

    const logs = await provider.getLogs({
      address: factory,
      fromBlock: start,
      toBlock: end,
      topics: [topic0],
    });

    // console.log('Fetched logs from blocks', start, 'to', end, ':', logs.length);

    for (const log of logs) {
      const parsed = v3FactoryIface.parseLog(log);
      if (parsed) {
        pools.push({
          token0: parsed.args.token0,
          token1: parsed.args.token1,
          fee: Number(parsed.args.fee),
          tickSpacing: Number(parsed.args.tickSpacing),
          pool: parsed.args.pool,
          blockNumber: log.blockNumber,
        });
      }
    }
    lastProcessedBlock = end;
  }

  return { pools, latestBlock: endBlock };
}
