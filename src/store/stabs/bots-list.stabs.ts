import {IBotsRule, IBotType, IJobType, IPool} from '../state.types';
import {ArbitrumPoolsConfigListStabs} from '../../scripts/arbQuoter/networks/arbitrum/arbitrumPoolsConfigList.stabs.js';
import {BasePoolsConfigListStabs} from '../../scripts/arbQuoter/networks/base/basePoolsConfigList.stabs.js';
import {BlastPoolsConfigListStabs} from '../../scripts/arbQuoter/networks/blast/blastPoolsConfigList.stabs.js';
import {LineaPoolsConfigListStabs} from '../../scripts/arbQuoter/networks/linea/lineaPoolsConfigList.stabs.js';
import {OptimismPoolsConfigListStabs} from '../../scripts/arbQuoter/networks/optimism/optimismPoolsConfigList.stabs.js';

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
    "id": "1",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      "delayBetweenRepeat": 200,
      "maxJobs": 1000000,
      "maxErrors": 100,
      "timeoutMs": 30000
    },
    "jobParams": ArbitrumPoolsConfigListStabs as any
  },
  {
    "id": "2",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      "delayBetweenRepeat": 1000,
      "maxJobs": 1000000,
      "maxErrors": 100,
      "timeoutMs": 30000
    },
    "jobParams": BasePoolsConfigListStabs as any
  },
  {
    "id": "3",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      "delayBetweenRepeat": 200,
      "maxJobs": 1000000,
      "maxErrors": 100,
      "timeoutMs": 30000
    },
    "jobParams": BlastPoolsConfigListStabs as any
  },
  {
    "id": "4",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      "delayBetweenRepeat": 200,
      "maxJobs": 1000000,
      "maxErrors": 100,
      "timeoutMs": 30000
    },
    "jobParams": LineaPoolsConfigListStabs as any
  },
  {
    "id": "5",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      "delayBetweenRepeat": 200,
      "maxJobs": 1000000,
      "maxErrors": 100,
      "timeoutMs": 30000
    },
    "jobParams": OptimismPoolsConfigListStabs as any
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

