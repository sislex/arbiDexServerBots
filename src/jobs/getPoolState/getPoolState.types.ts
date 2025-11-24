export interface PoolTickState {
  index: number;                 // tick index (int24)
  liquidityNet: string;          // JSON-safe
  liquidityGross: string;        // JSON-safe
  initialized: boolean;
}

export interface PoolState {
  poolAddress: string;
  chainId?: number;

  token0: string;
  token1: string;
  fee: number;                   // uint24
  tickSpacing: number;

  sqrtPriceX96: string;          // uint160 -> string
  tick: number;                  // int24
  liquidity: string;             // uint128 -> string

  observationCardinality: number;
  observationCardinalityNext: number;

  ticksScanned: number;
  ticks: PoolTickState[];
}
