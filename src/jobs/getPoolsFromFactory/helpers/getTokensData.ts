import { ethers } from 'ethers';


const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

type TokenData = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
};

type Pool = {
  token0: string;
  token1: string;
  pool?: string; //pair/pool в зависимости от фабрики
  pair?: string; //pair/pool в зависимости от фабрики
  blockNumber: number;
};

export function getUniqueTokens(pools: Pool[]): string[] {
  const tokenSet = new Set<string>();

  for (const pool of pools) {
    tokenSet.add(pool.token0.toLowerCase());
    tokenSet.add(pool.token1.toLowerCase());
  }

  return Array.from(tokenSet);
}


export async function setProvider(rpc: string, chainId: number) {
  return new ethers.JsonRpcProvider(rpc, { chainId, name: chainId.toString() }, { staticNetwork: true });
}

export async function fetchTokensData(
  provider: any,
  tokenAddresses: string[],
): Promise<TokenData[]> {
  const results: TokenData[] = [];

  const CONCURRENCY = 1;
  for (let i = 0; i < tokenAddresses.length; i += CONCURRENCY) {
    const batch = tokenAddresses.slice(i, i + CONCURRENCY);

    const promises = batch.map(async (addr) => {
      try {
        const contract = new ethers.Contract(addr, ERC20_ABI, provider);

        const [symbol, name, decimals] = await Promise.all([
          contract.symbol(),
          contract.name(),
          contract.decimals(),
        ]);

        return {
          address: addr.toLowerCase(),
          symbol,
          name,
          decimals: Number(decimals),
        } as TokenData;
      } catch (err) {
        // console.warn('Error fetching token', addr, err);
        return null;
      }
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults.filter((r): r is TokenData => r !== null));
  }

  return results;
}
