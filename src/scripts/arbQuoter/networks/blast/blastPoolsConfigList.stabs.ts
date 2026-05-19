import { DeployedImpactQuoteStabsConfig } from '../helpers/types';

export const BlastPoolsConfigListStabs: DeployedImpactQuoteStabsConfig = {
  source: 'dex:blast',
  rpcUrl: 'https://rpc.blast.io',
  extraSettings: {
    amountIn: 0.01,
    amountOut: 25,
  },
  opts: {
    tokenIn: {
      symbol: 'WETH',
      decimals: 18,
      address: '0x4300000000000000000000000000000000000004',
    },
    tokenOut: {
      symbol: 'USDB',
      decimals: 18,
      address: '0x4300000000000000000000000000000000000003',
    },
  },
  pairsToQuote: [
    {
      dex: "uniswap",
      version: "v3",
      poolAddress: "0xf5A23bDD36a56EDe75D503F6f643d5eaF25B1a8F",
      feePpm: 500,
    },
    {
      dex: "uniswap",
      version: "v2",
      poolAddress: "0xAd06cD451fe4034a6dD515Af08E222a3d95B4A1C",
      feePpm: 3000,
    },
    {
      dex: "sushi",
      version: "v2",
      poolAddress: "0xAd06cD451fe4034a6dD515Af08E222a3d95B4A1C",
      feePpm: 500,
    },
    {
      dex: "sushi",
      version: "v3",
      poolAddress: "0xcd03572e7cfb94996beebaa539234ce5c23ae1d6",
      feePpm: 3000,
    },
    {
      dex: "sushi",
      version: "v3",
      poolAddress: "0xff6b9398265c3754d92d0953a432615edd28fbf7",
      feePpm: 10000,
    },
  ],
};


