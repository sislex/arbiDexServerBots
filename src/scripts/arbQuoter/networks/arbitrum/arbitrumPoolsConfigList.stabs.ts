export const ArbitrumPoolsConfigListStabs = {
  "jobType": "get_Dex_Quotes_By_Arb_Quoter",
  "source": "dex:arbitrum",
  "rpcUrl": "https://arb1.arbitrum.io/rpc",
  "extraSettings": {
    amountIn: 0.01,
    amountOut: 25,
    referenceDivisor: 100,
  },
  "opts": {
    "tokenIn": {
      "symbol": "WETH",
      "decimals": 18,
      "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
    },
    "tokenOut": {
      "symbol": "USDC",
      "decimals": 6,
      "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831"
    }
  },
  "pairsToQuote": [
    {
      "dex": "uniswap",
      "version": "v2",
      "poolAddress": "0xf64dfe17c8b87f012fcf50fbda1d62bfa148366a",
      "feePpm": 3000
    },
    {
      "dex": "sushi",
      "version": "v3",
      "poolAddress": "0xf3eb87c1f6020982173c908e7eb31aa66c1f0296",
      "feePpm": 500
    },
    {
      "dex": "uniswap",
      "version": "v3",
      "poolAddress": "0xc473e2aee3441bf9240be85eb122abb059a3b57c",
      "feePpm": 3000
    },
    {
      "dex": "uniswap",
      "version": "v3",
      "poolAddress": "0xc6962004f452be9203591991d15f6b388e09e8d0",
      "feePpm": 500
    },
    {
      "dex": "uniswap",
      "version": "v3",
      "poolAddress": "0x6f38e884725a116c9c7fbf208e79fe8828a2595f",
      "feePpm": 100
    },
    {
      "dex": "uniswap",
      "version": "v3",
      "poolAddress": "0x42fc852a750ba93d5bf772ecdc857e87a86403a9",
      "feePpm": 10000
    },
    {
      "dex": "camelot",
      "version": "v2",
      "poolAddress": "0x54b26faf3671677c19f70c4b879a6f7b898f732c",
      "feePpm": 3000
    },
    {
      "dex": "camelot",
      "version": "v3",
      "poolAddress": "0xb1026b8e7276e7ac75410f1fcbbe21796e8f7526",
      "feePpm": 3000
    }
  ]
}
