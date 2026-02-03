import {V2DexesMap, V3QuotersMap} from '../store/state.types';

export const MULTICALL3 = "0xca11bde05977b3631167028862be2a173976ca11";

export const UNISWAP_V2_FACTORY = "0xf1D7CC64Fb4452F05c498126312eBE29F30Bfcf9";
export const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

export const SUSHISWAP_V2_FACTORY = '0xc35dadb65012ec5796536bd9864ed8773abc74c4';
export const SUSHISWAP_V3_FACTORY = '0x1Af415A1EbA07A4986A52B6F2E7DE7003d82231E';

export const CAMELOT_V2_FACTORY  = '0x6EcCab422D763AC031210895C81787E87B43A652';
export const CAMELOT_V3_FACTORY  = '0x1a3C9B1d2F0529D97f2AfC5136Cc23E58f1FD35B';

// ABIs
export const MULTICALL_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)"
];

export const UNISWAP_V3_FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
];

const POOLID_QUOTER_ABI = [
  // ---- main method ----
  "function quoteBothBase((address pool,address baseToken,address quoteToken,uint256 amountBase,uint160 sqrtPriceLimitX96)) external returns (tuple(" +
  "uint256 blockNumber," +
  "address pool," +
  "address token0," +
  "address token1," +
  "uint24 fee," +
  "uint160 sqrtPriceX96Before," +
  "int24 tickBefore," +
  "tuple(uint256 amountOut,uint160 sqrtPriceX96After,uint32 initializedTicksCrossed,uint256 gasEstimate) exactIn," +
  "tuple(uint256 amountIn,uint160 sqrtPriceX96After,uint32 initializedTicksCrossed,uint256 gasEstimate) exactOut" +
  "))",

  // ---- custom errors ----
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

export const CAMELOT_V2_ROUTER_ABI = [
  "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint,uint,address[],address,address,uint)",
  "function swapExactETHForTokensSupportingFeeOnTransferTokens(uint,address[],address,address,uint)",
  "function swapExactTokensForETHSupportingFeeOnTransferTokens(uint,uint,address[],address,address,uint)",
];

export const ALGEBRA_QUOTER_ABI = [
  // exactIn
  "function quoteExactInputSingle(address tokenIn,address tokenOut,uint256 amountIn,uint160 limitSqrtPrice) external returns (uint256 amountOut,uint160 sqrtPriceX96After,int24 tickAfter,uint256 gasEstimate)",
  // (опционально) exactOut
  "function quoteExactOutputSingle(address tokenIn,address tokenOut,uint256 amountOut,uint160 limitSqrtPrice) external returns (uint256 amountIn,uint160 sqrtPriceX96After,int24 tickAfter,uint256 gasEstimate)",
];



export const V2_DEXES: V2DexesMap = {
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
  },
  camelot: {
    name: 'Camelot V2',
    router: '0xc873fecbd354f5a56e00e710b90ef4201db2448d',
    abi: CAMELOT_V2_ROUTER_ABI,
  },
} as const;

export const V3_QUOTERS: V3QuotersMap = {
  poolId: {
    name: 'PoolId Quoter (V3-like)',
    quoter: '0x5F61BD957276B28Be96571C2F9876E2ECD85C648',
    abi: POOLID_QUOTER_ABI,
  },

  uniswap: {
    name: 'Uniswap V3',
    quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    abi: UNISWAP_QUOTER_V2_ABI,
  },

  sushi: {
    name: 'SushiSwap V3',
    quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    abi: UNISWAP_QUOTER_V2_ABI,
  },

  camelot: {
    name: 'Camelot V3 (AMMv3 / Algebra)',
    quoter: '0x0fc73040b26e9bc8514fa028d998e73a254fa76e',
    abi: ALGEBRA_QUOTER_ABI,
  },

} as const;

