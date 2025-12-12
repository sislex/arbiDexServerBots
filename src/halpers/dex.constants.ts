export const MULTICALL3 = "0xca11bde05977b3631167028862be2a173976ca11";

export const UNISWAP_V2_FACTORY = "0xf1D7CC64Fb4452F05c498126312eBE29F30Bfcf9";
export const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
export const UNISWAP_V2_ROUTER = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24";
export const UNISWAP_V3_QUOTER_V2 = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";

export const SUSHISWAP_V2_ROUTER = "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506";


export const V2_DEXES = {
  uniswap: {
    name: 'Uniswap V2',
    router: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
  },
  sushi: {
    name: 'SushiSwap V2',
    router: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506',
  },
  pancake: {
    name: 'PancakeSwap V2',
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  }
} as const;


// ABIs
export const MULTICALL_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)"
];

export const UNISWAP_FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
];
export const UNISWAP_QUOTER_V2_ABI = [
  "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
  "function quoteExactOutputSingle((address tokenIn, address tokenOut, uint256 amountOut, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountIn, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)"
];
export const UNISWAP_V2_ROUTER_ABI = [
  "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)",
  "function getAmountsIn(uint256 amountOut, address[] calldata path) external view returns (uint256[] memory amounts)"
];

export const getV2RouterAbiByDex = (dex: 'uniswap' | 'sushi'): {router: string, abi: string[]} => {
  switch (dex) {
    case 'uniswap':
      return {router: V2_DEXES.uniswap.router, abi: UNISWAP_V2_ROUTER_ABI};
    case 'sushi':
      return {router: V2_DEXES.sushi.router, abi: UNISWAP_V2_ROUTER_ABI};
    default:
      throw new Error(`Unsupported dex for V2 router ABI: ${dex}`);
  }
}
