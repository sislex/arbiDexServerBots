export const LineaPoolsConfigListStabs = {
  "jobType": "get_Dex_Quotes_By_Arb_Quoter",
  "source": "dex:linea",
  "rpcUrl": "https://rpc.linea.build",
  "extraSettings": {
    amountIn: 0.01,
    amountOut: 25,
    referenceDivisor: 100,
  },
  "opts": {
    "tokenIn": {
      "symbol": "WETH",
      "decimals": 18,
      "address": "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f"
    },
    "tokenOut": {
      "symbol": "USDC",
      "decimals": 6,
      "address": "0x176211869cA2b568f2A7D4EE941E073a821EE1ff"
    }
  },
  "pairsToQuote": [
    {
      "dex": "uniswap",
      "version": "v3",
      "poolAddress": "0xc48622190a6B91d64ee7459C62fadE9AbE61b48a",
      "feePpm": 500
    },
    {
      "dex": "sushi",
      "version": "v3",
      "poolAddress": "0xb273e954983abae94ec500c19f1a23790d3553d3",
      "feePpm": 3000
    }
  ]
}
