import {IBotsRule, IBotType, IJobType, IPool} from '../state.types';

export const BotListTestOptimism: IBotsRule[] = [
  {
    "id": "168",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      "delayBetweenRepeat": 250,
      "maxJobs": 1000000,
      "maxErrors": 100,
      "timeoutMs": 30000
    },
    "jobParams": {
      "extraSettings": "{\n  \"amountIn\": 100,\n  \"amountOut\":  870\n}",
      "jobType": IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER,
      "rpcUrl": "https://mainnet.optimism.io",
      "source": "dex:optimism",
      "opts": {
        "tokenIn": {
          "decimals": 6,
          "symbol": "USDC",
          "address": "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
        },
        "tokenOut": {
          "decimals": 18,
          "symbol": "OP",
          "address": "0x4200000000000000000000000000000000000042",
        }
      },
      "pairsToQuote": [
        {
          "dex": "uniswap",
          "version": "v3",
          "poolAddress": "0x6f32061f59a21086c334d0d45f804089ce374aaf",
          "feePpm": 10000
        }
      ]
    }
  },
];

export const BotListTestArbitrum: IBotsRule[] = [
  {
    "id": "168",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      "delayBetweenRepeat": 250,
      "maxJobs": 1000000,
      "maxErrors": 100,
      "timeoutMs": 30000
    },
    "jobParams": {
      "extraSettings": "{\n  \"amountIn\": 100,\n  \"amountOut\": 0.03\n}",
      "jobType": IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER,
      "rpcUrl": "https://arb1.arbitrum.io/rpc",
      "source": "dex:arbitrum",
      "opts": {
        "tokenIn": {
          "decimals": 6,
          "symbol": "USDC",
          "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831"
        },
        "tokenOut": {
          "decimals": 18,
          "symbol": "WETH",
          "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
        }
      },
      "pairsToQuote": [
        {
          "dex": "sushi",
          "version": "v3",
          "poolAddress": "0xb658ee5c63922d2852f24458effa2bfa2cba3574",
          "feePpm": 100
        },
        {
          "dex": "uniswap",
          "version": "v2",
          "poolAddress": "0xf64dfe17c8b87f012fcf50fbda1d62bfa148366a",
          "feePpm": 3000
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
          "dex": "sushi",
          "version": "v2",
          "poolAddress": "0x57b85fef094e10b5eecdf350af688299e9553378",
          "feePpm": 3000
        },
        {
          "dex": "sushi",
          "version": "v3",
          "poolAddress": "0xf3eb87c1f6020982173c908e7eb31aa66c1f0296",
          "feePpm": 500
        },
        {
          "dex": "sushi",
          "version": "v3",
          "poolAddress": "0xc96525298419f7e00da8826b733ee52e271662b5",
          "feePpm": 3000
        },
        {
          "dex": "sushi",
          "version": "v3",
          "poolAddress": "0x0ed17087175a677c05328a37b9795728e9cd8821",
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
          "feePpm": 0
        },
        {
          "dex": "pancake",
          "version": "v3",
          "poolAddress": "0xd9e2a1a61b6e61b275cec326465d417e52c1b95c",
          "feePpm": 500
        },
        {
          "dex": "pancake",
          "version": "v3",
          "poolAddress": "0xb3d494d53aac707c469318f15cfd5d7857a61388",
          "feePpm": 2500
        },
        {
          "dex": "pancake",
          "version": "v3",
          "poolAddress": "0x7fcdc35463e3770c2fb992716cd070b63540b947",
          "feePpm": 100
        },
        {
          "dex": "pancake",
          "version": "v3",
          "poolAddress": "0xbedb464ef776fe208e3f2b5c0bafbe7983ef49db",
          "feePpm": 10000
        }
      ] as IPool[]
    }
  },
];

export const BotList10: IBotsRule[] = [
  {
    id: 'BOT-DEX-001',
    botParams: {
      botType: IBotType.TEST_BOT, // Замените на актуальный тип, если отличается
      paused: false,
      isRepeat: true,
      delayBetweenRepeat: 60,
      maxJobs: 1000000,
      maxErrors: 100,
      timeoutMs: 30000,
      description: 'DEX quotes bot (Arbitrum WBTC/ARB)',
    },
    jobParams: {
      jobType: IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER_SCRIPT,
      source: 'dex:arbitrum',
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      extraSettings: {
        amountIn: 0.01,
        amountOut: 25,
        referenceDivisor: 100
      },
      opts: {
        tokenIn: {
          decimals: 8,
          symbol: 'WBTC',
          address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'
        },
        tokenOut: {
          decimals: 18,
          symbol: 'ARB',
          address: '0x912ce59144191c1204e64559fe8253a0e49e6548'
        }
      },
      pairsToQuote: [
        {
          dex: 'uniswap',
          version: 'v3',
          poolAddress: '0x214fb3fef13e49b01abd4504c23defb735168341',
          feePpm: 100
        },
        {
          dex: 'camelot',
          version: 'v3',
          poolAddress: '0x5d6bd8b091c14432abee34b726ff226168adfdb8',
          feePpm: 0
        },
        {
          dex: 'uniswap',
          version: 'v3',
          poolAddress: '0x689c96ceab93f5e131631d225d75dea3fd37747e',
          feePpm: 3000
        },
        {
          dex: 'uniswap',
          version: 'v3',
          poolAddress: '0x12c796f54c13183ed00e394036509349126f3a07',
          feePpm: 10000
        },
        {
          dex: 'sushi',
          version: 'v3',
          poolAddress: '0xec9d135a8d404cbc528f8a92115b9d67e26cf6ea',
          feePpm: 10000
        },
        {
          dex: 'sushi',
          version: 'v3',
          poolAddress: '0xe65ac00dd2a781780e1902fb7e9f77509602f22c',
          feePpm: 3000
        },
        {
          dex: 'sushi',
          version: 'v2',
          poolAddress: '0x91f0f14370c83bc108cc03cf35cd0b9ccea4b1a5',
          feePpm: 3000
        },
        {
          dex: 'uniswap',
          version: 'v3',
          poolAddress: '0x0b040426b92c405d39c31263f1f98680e84cb699',
          feePpm: 500
        }
      ]
    }
  },
  {
    id: 'BOT-CEX-001',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: false,
      isRepeat: true,
      delayBetweenRepeat: 600,
      maxJobs: 1000000,
      maxErrors: 100,
      timeoutMs: 30000,
      description: 'CEX quotes bot (Binance ETH/USDT)',
    },
    jobParams: {
      jobType: IJobType.GET_CEX_QUOTES,
      source: 'binance',
      token0: 'ETH',
      token1: 'USDT',
    },
  },
];

