import { ethers } from 'ethers';

export const ARBISCAN_RPC2 = 'https://arb1.arbitrum.io/rpc';

const camelotV3FactoryIface = new ethers.Interface([
  'event Pool(address indexed token0, address indexed token1, address pool)',
]);

export async function getCamelotV3PoolsFromFactory(
  factoryAddress: string,
  fromBlock = 0,
  toBlock?: number,
) {
  const provider = new ethers.JsonRpcProvider(ARBISCAN_RPC2);

  const factory = ethers.getAddress(factoryAddress.toLowerCase());
  const latest = await provider.getBlockNumber();
  const endBlock = Math.min(toBlock ?? latest, latest);

  console.log('=== Real network latest ===', latest);
  console.log('=== We will scan up to ===', endBlock);

  const topic0 = ethers.id('Pool(address,address,address)');
  const step = 100_000;

  const pools: {
    token0: string;
    token1: string;
    pool: string;
    blockNumber: number;
  }[] = [];

  for (let start = fromBlock; start <= endBlock; start += step + 1) {
    const end = Math.min(endBlock, start + step);

    const logs = await provider.getLogs({
      address: factory,
      fromBlock: start,
      toBlock: end,
      topics: [topic0],
    });

    // console.log(`[Camelot V3] blocks ${start} → ${end}, logs: ${logs.length}`);

    for (const log of logs) {
      const parsed = camelotV3FactoryIface.parseLog(log);
      if (!parsed) continue;

      pools.push({
        token0: parsed.args.token0,
        token1: parsed.args.token1,
        pool: parsed.args.pool,
        blockNumber: log.blockNumber,
      });
    }
  }

  return { pools, latestBlock: endBlock };
}
