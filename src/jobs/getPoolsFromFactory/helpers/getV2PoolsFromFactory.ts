import { ethers } from 'ethers';

export const ARBISCAN_RPC2 = 'https://arb1.arbitrum.io/rpc';

const v2FactoryIface = new ethers.Interface([
  'event PairCreated(address indexed token0, address indexed token1, address pair, uint256)',
]);

export async function getV2PoolsFromFactory(
  factoryAddress: string,
  fromBlock = 0,
  toBlock?: number,
) {
  const provider = new ethers.JsonRpcProvider(ARBISCAN_RPC2);

  const factory = ethers.getAddress(factoryAddress.toLowerCase());

  const latest = await provider.getBlockNumber();
  const endBlock = toBlock ?? latest;
  console.log('===latest===', latest);

  const topic0 = ethers.id('PairCreated(address,address,address,uint256)');
  const step = 100_000;

  const pools: {
    token0: string;
    token1: string;
    pair: string;
    blockNumber: number;
  }[] = [];

  let lastProcessedBlock = fromBlock;

  for (let start = fromBlock; start <= endBlock; start += step + 1) {
    const end = Math.min(endBlock, start + step);

    const logs = await provider.getLogs({
      address: factory,
      fromBlock: start,
      toBlock: end,
      topics: [topic0],
    });

    // console.log(`[Blocks] ${start} → ${end}, logs: ${logs.length}`);

    for (const log of logs) {
      const parsed = v2FactoryIface.parseLog(log);
      if (!parsed) continue;

      pools.push({
        token0: parsed.args.token0,
        token1: parsed.args.token1,
        pair: parsed.args.pair,
        blockNumber: log.blockNumber,
      });
    }
    lastProcessedBlock = end;
  }

  return { pools, latestBlock: endBlock };
}
