import { ethers } from "ethers";

// ====== Sushi V2 Factory (Arbitrum) ======
export const SUSHI_V2_FACTORY_ARBITRUM = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";

const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
];

export interface ITokenInfo {
  address: string;
  decimals: number;
  symbol?: string;
}

export interface IPoolsSettings {
  tokenIn: ITokenInfo;
  tokenOut: ITokenInfo;
  amountList: string[];
  feePpm?: number;          // для V2 не нужен, но пусть живёт для унификации
  poolAddress?: string;     // сюда проставим
}

export interface HydrateResult {
  withAddress: IPoolsSettings[];
  missing: Array<{
    tokenIn: ITokenInfo;
    tokenOut: ITokenInfo;
    reason: "PAIR_NOT_FOUND" | "RPC_ERROR";
    error?: string;
  }>;
}

export async function hydrateSushiV2Pools(params: {
  rpcUrl: string;
  pools: IPoolsSettings[];
  factoryAddress?: string;
  concurrency?: number;
  onProgress?: (info: { done: number; total: number; last?: string }) => void;
}): Promise<HydrateResult> {
  const {
    rpcUrl,
    pools,
    factoryAddress = SUSHI_V2_FACTORY_ARBITRUM,
    concurrency = 6,
    onProgress,
  } = params;

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);

  const withAddress: IPoolsSettings[] = [];
  const missing: HydrateResult["missing"] = [];

  let done = 0;

  // маленький worker-pool по concurrency
  const queue = pools.slice();

  async function worker() {
    while (queue.length) {
      const p = queue.shift()!;
      const a = ethers.getAddress(p.tokenIn.address);
      const b = ethers.getAddress(p.tokenOut.address);

      try {
        const pair: string = await factory.getPair(a, b);

        if (pair && pair !== ethers.ZeroAddress) {
          withAddress.push({
            ...p,
            poolAddress: pair,
          });
        } else {
          missing.push({
            tokenIn: p.tokenIn,
            tokenOut: p.tokenOut,
            reason: "PAIR_NOT_FOUND",
          });
        }
      } catch (e: any) {
        missing.push({
          tokenIn: p.tokenIn,
          tokenOut: p.tokenOut,
          reason: "RPC_ERROR",
          error: e?.shortMessage || e?.message || String(e),
        });
      } finally {
        done++;
        onProgress?.({
          done,
          total: pools.length,
          last: `${p.tokenIn.symbol ?? p.tokenIn.address} -> ${p.tokenOut.symbol ?? p.tokenOut.address}`,
        });
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, concurrency) }, () => worker());
  await Promise.all(workers);

  return { withAddress, missing };
}
