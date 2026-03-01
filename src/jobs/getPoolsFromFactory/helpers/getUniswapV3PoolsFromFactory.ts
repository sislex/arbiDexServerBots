import { ethers } from 'ethers';

const v3FactoryIface = new ethers.Interface([
  'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
]);

export async function getUniswapV3PoolsFromFactory(
  rpc: string,
  factoryAddress: string,
  fromBlock = 0,
  toBlock?: number,
) {
  const provider = new ethers.JsonRpcProvider(rpc);
  const factory = ethers.getAddress(factoryAddress.toLowerCase());
  const latest = await provider.getBlockNumber();
  const endBlock = Math.min(toBlock ?? latest, latest);

  console.log('=== Real network latest ===', latest);
  console.log('=== We will scan up to ===', endBlock);

  const topic0 = ethers.id('PoolCreated(address,address,uint24,int24,address)');
  const step = 100_000;

  const pools: any[] = [];

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
  }

  return { pools, latestBlock: endBlock };
}
