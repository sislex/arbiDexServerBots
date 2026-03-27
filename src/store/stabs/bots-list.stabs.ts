import {IBotsRule, IBotType, IJobType, IPool} from '../state.types';
export const BotList10: IBotsRule[] = [
  {
    "id": "Binance_USDC_WETH",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      delayBetweenRepeat: 200,
      maxJobs: 1000000,
      maxErrors: 100,
      timeoutMs: 30000,
    },
    "jobParams": {
      "jobType": IJobType.GET_BINANCE_QUOTES,
      "symbol": "ETHUSDC",
    }
  },
  {
    "id": "Mexc_USDT_WETH",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      delayBetweenRepeat: 200,
      maxJobs: 1000000,
      maxErrors: 100,
      timeoutMs: 30000,
    },
    "jobParams": {
      "jobType": IJobType.GET_MEXC_QUOTES,
      "symbol": "ETHUSDT",
    }
  },
  {
    "id": "Bybit_USDT_WETH",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      delayBetweenRepeat: 200,
      maxJobs: 1000000,
      maxErrors: 100,
      timeoutMs: 30000,
    },
    "jobParams": {
      "jobType": IJobType.GET_BYBIT_QUOTES,
      "symbol": "ETHUSDT",
    }
  },
  {
    "id": "OKX_USDT_WETH",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      delayBetweenRepeat: 200,
      maxJobs: 1000000,
      maxErrors: 100,
      timeoutMs: 30000,
    },
    "jobParams": {
      "jobType": IJobType.GET_OKX_QUOTES,
      "symbol": "ETH-USDT",
    }
  },
  {
    "id": "KuCoin_USDT_WETH",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      delayBetweenRepeat: 200,
      maxJobs: 1000000,
      maxErrors: 100,
      timeoutMs: 30000,
    },
    "jobParams": {
      "jobType": IJobType.GET_KUCOIN_QUOTES,
      "symbol": "ETH-USDT",
    }
  },
  {
    "id": "GateIO_USDT_WETH",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      delayBetweenRepeat: 200,
      maxJobs: 1000000,
      maxErrors: 100,
      timeoutMs: 30000,
    },
    "jobParams": {
      "jobType": IJobType.GET_GATEIO_QUOTES,
      "symbol": "ETH_USDT",
    }
  },
  {
    "id": "Arbitrum_USDC_WETH",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      delayBetweenRepeat: 500,
      maxJobs: 1000000,
      maxErrors: 100,
      timeoutMs: 30000,
    },
    "jobParams": {
      "jobType": IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER,
      "rpcUrl": "https://arb-mainnet.g.alchemy.com/v2/_T_Qkk4fOdQ7jQbGjSW2F",
      "stepPrefundPct": 2,
      "pairsToQuote": [
        {
          "dex": "pancake",
          "version": "v3",
          "poolAddress": "0xbedb464ef776fe208e3f2b5c0bafbe7983ef49db",
          "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          "feePpm": 10000
        },
        {
          "dex": "pancake",
          "version": "v3",
          "poolAddress": "0x7fcdc35463e3770c2fb992716cd070b63540b947",
          "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          "feePpm": 100
        },
        {
          "dex": "pancake",
          "version": "v3",
          "poolAddress": "0xb3d494d53aac707c469318f15cfd5d7857a61388",
          "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          "feePpm": 2500
        },
        {
          "dex": "pancake",
          "version": "v3",
          "poolAddress": "0xd9e2a1a61b6e61b275cec326465d417e52c1b95c",
          "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          "feePpm": 500
        },
        {
          "dex": "camelot",
          "version": "v3",
          "poolAddress": "0xb1026b8e7276e7ac75410f1fcbbe21796e8f7526",
          "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          "feePpm": 0
        },
        {
          "dex": "sushi",
          "version": "v3",
          "poolAddress": "0xb658ee5c63922d2852f24458effa2bfa2cba3574",
          "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          "feePpm": 100
        },
        {
          "dex": "sushi",
          "version": "v3",
          "poolAddress": "0x0ed17087175a677c05328a37b9795728e9cd8821",
          "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          "feePpm": 10000
        },
        {
          "dex": "sushi",
          "version": "v3",
          "poolAddress": "0xc96525298419f7e00da8826b733ee52e271662b5",
          "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          "feePpm": 3000
        },
        {
          "dex": "sushi",
          "version": "v3",
          "poolAddress": "0xf3eb87c1f6020982173c908e7eb31aa66c1f0296",
          "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          "feePpm": 500
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "poolAddress": "0x42fc852a750ba93d5bf772ecdc857e87a86403a9",
          "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          "feePpm": 10000
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "poolAddress": "0x6f38e884725a116c9c7fbf208e79fe8828a2595f",
          "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          "feePpm": 100
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "poolAddress": "0xc6962004f452be9203591991d15f6b388e09e8d0",
          "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          "feePpm": 500
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "poolAddress": "0xc473e2aee3441bf9240be85eb122abb059a3b57c",
          "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          "feePpm": 3000
        },
      ] as IPool[]
    }
  },
];


