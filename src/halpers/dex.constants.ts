export const MULTICALL3 = "0xca11bde05977b3631167028862be2a173976ca11";

export const UNISWAP_V2_FACTORY = "0xf1D7CC64Fb4452F05c498126312eBE29F30Bfcf9";
export const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

// ABIs
export const MULTICALL_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)"
];

export const UNISWAP_FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
];

const POOLID_QUOTER_ABI = [
  "function quoteByPoolId((address baseToken,address quoteToken,address pool,uint256 amountBase,uint160 sqrtPriceLimitX96)) external returns (tuple(uint256 blockNumber,address pool,address token0,address token1,uint24 fee,uint160 sqrtPriceX96,int24 tick,uint256 amountOutQuote,uint256 gasUsedExactIn,uint256 amountInQuoteForBase,uint256 gasUsedExactOut))",
  // на всякий — чтобы декодить ошибки твоего контракта:
  "error NotFromPool()",
  "error TokenNotInPool()",
  "error InvalidAmount()",
] as const;

export const UNISWAP_QUOTER_V2_ABI = [
  "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
  "function quoteExactOutputSingle((address tokenIn, address tokenOut, uint256 amountOut, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountIn, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)"
];
export const UNISWAP_V2_ROUTER_ABI = [
  "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)",
  "function getAmountsIn(uint256 amountOut, address[] calldata path) external view returns (uint256[] memory amounts)"
];



export const V2_DEXES = {
  uniswap: {
    name: 'Uniswap V2',
    router: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
    abi: UNISWAP_V2_ROUTER_ABI,
  },
  sushi: {
    name: 'SushiSwap V2',
    router: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506',
    abi: UNISWAP_V2_ROUTER_ABI,
  },
  pancake: {
    name: 'PancakeSwap V2',
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    abi: UNISWAP_V2_ROUTER_ABI,
  }
} as const;

export const V3_QUOTERS = {
  poolId: {
    name: 'PoolId Quoter (V3-like)',
    quoter: '0x07f91ED27Bf8804262bc020D0F214aD519f59dDE',
    abi: POOLID_QUOTER_ABI,
  },

  uniswap: {
    name: 'Uniswap V3',
    quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    abi: UNISWAP_QUOTER_V2_ABI,
  },

  sushi: {
    name: 'SushiSwap V3',
    // ⚠️ если Sushi V3 использует тот же periphery (часто так и есть)
    quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    abi: UNISWAP_QUOTER_V2_ABI,
  },

  /*
  pancake: {
    name: 'PancakeSwap V3',
    quoter: '0x....', // другой адрес, если сеть ≠ Arbitrum
    abi: UNISWAP_QUOTER_V2_ABI,
  }
  */
} as const;

