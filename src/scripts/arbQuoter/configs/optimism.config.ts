import { DeployedImpactQuoteStabsConfig } from '../helpers/types';

export const OptimismPoolsConfigListStabs: DeployedImpactQuoteStabsConfig = {
  source: 'dex:optimism',
  rpcUrl: 'https://mainnet.optimism.io',
  extraSettings: {
    amountIn: 0.01,
  },
  opts: {
    tokenIn: {
      symbol: 'WETH',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000006',
    },
    tokenOut: {
      symbol: 'USDC',
      decimals: 6,
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    },
  },
  pairsToQuote: [
    {
      dex: 'uniswap',
      version: 'v3',
      poolAddress: '0xc1738D90E2E26C35784A0d3E3d8A9f795074bcA4',
      feePpm: 3000,
    },
    {
      dex: 'uniswap',
      version: 'v3',
      poolAddress: '0x1fb3cf6e48F1E7B10213E7b6d87D4c073C7Fdb7b',
      feePpm: 500,
    },
    {
      dex: 'sushi',
      version: 'v3',
      poolAddress: '0x146eda2f1d35efb5eef5703acec701c68e1503d8',
      feePpm: 500,
    },
  ],
};

