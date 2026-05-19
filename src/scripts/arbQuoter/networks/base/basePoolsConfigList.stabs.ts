import { DeployedImpactQuoteStabsConfig } from '../helpers/types';

export const BasePoolsConfigListStabs: DeployedImpactQuoteStabsConfig = {
  source: 'dex:base',
  rpcUrl: 'https://mainnet.base.org',
  extraSettings: {
    amountIn: 0.01,
    amountOut: 25,
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
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
  },
  pairsToQuote: [
    {
      dex: "uniswap",
      version: "v2",
      poolAddress: "0x88A43bbDF9D098eEC7bCEda4e2494615dfD9bB9C",
      feePpm: 3000,
    },
    {
      dex: "uniswap",
      version: "v3",
      poolAddress: "0x6c561B446416E1A00E8E93E221854d6eA4171372",
      feePpm: 3000,
    },
    {
      dex: "uniswap",
      version: "v3",
      poolAddress: "0xd0b53d9277642d899df5c87a3966a349a798f224",
      feePpm: 500,
    },
    {
      dex: "sushi",
      version: "v3",
      poolAddress: "0x57713f7716e0b0f65ec116912f834e49805480d2",
      feePpm: 500,
    },
    {
      dex: "sushi",
      version: "v3",
      poolAddress: "0x41595326aabe6132fc6c7ae71af087a3a9dbc9f6",
      feePpm: 3000,
    },
  ],
};


