import { IBotsRule, IBotType, IJobType, IQuote } from '../state.types';

export const BotsListSourceStab: IBotsRule[] = [
  {
    id: '1',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: false,
      isRepeat: true,
      delayBetweenRepeat: 10,
      maxJobs: 1,
      maxErrors: 100,
      timeoutMs: 1000,
    },
    jobParams: {
      jobType: IJobType.GET_ARB_EXECUTOR_QUOTES,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      pairsToQuote: [
        {
          dex: 'uniswap',
          version: 'v2',
          token0: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          token1: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          poolAddress: '0x103b03051bf073c44decfaf8dfd12275254ab97e',
          feePpm: 3000,
          tokenIn: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          tokenOut: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          side: 'exactIn',
          amount: '50000000000000000',
          blockTag: 'latest',
          quoteSource: 'quoteBothBase',
        },
        {
          dex: 'sushi',
          version: 'v2',
          token0: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          token1: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          poolAddress: '0xbf6cbb1f40a542af50839cad01b0dc1747f11e18',
          feePpm: 3000,
          tokenIn: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          tokenOut: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          side: 'exactIn',
          amount: '50000000000000000',
          blockTag: 'latest',
          quoteSource: 'uniswap-v2-router',
        },
        {
          dex: 'uniswap',
          version: 'v3',
          token0: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          token1: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          poolAddress: '0x89a4026e9ade251c67b7fb38054931a39936d9c5',
          feePpm: 100,
          tokenIn: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          tokenOut: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          side: 'exactIn',
          amount: '50000000000000000',
          blockTag: 'latest',
          quoteSource: 'quoteBothBase',
        },
        {
          dex: 'sushi',
          version: 'v3',
          token0: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          token1: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          poolAddress: '0x011cc642ae74315001eeb541c1d2d225e92ece3d',
          feePpm: 100,
          tokenIn: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          tokenOut: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          side: 'exactIn',
          amount: '50000000000000000',
          blockTag: 'latest',
          quoteSource: 'quoteBothBase',
        },

        // {
        //   "dex": "camelot",
        //   "version": "v2",
        //   "token0": {
        //     "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        //     "decimals": 18
        //   },
        //   "token1": {
        //     "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
        //     "decimals": 18
        //   },
        //   "poolAddress": "0xa6c5c7d189fa4eb5af8ba34e63dcdd3a635d433f",
        //   "feePpm": 3000,
        //   "tokenIn": {
        //     "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        //     "decimals": 18
        //   },
        //   "tokenOut": {
        //     "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
        //     "decimals": 18
        //   },
        //   "side": "exactIn",
        //   "amount": "50000000000000000",
        //   "blockTag": "latest",
        //   "quoteSource": "quoteBothBase"
        // },
        // {
        //   "dex": "camelot",
        //   "version": "v3",
        //   "token0": {
        //     "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        //     "decimals": 18
        //   },
        //   "token1": {
        //     "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
        //     "decimals": 18
        //   },
        //   "poolAddress": "0xe51635ae8136abac44906a8f230c2d235e9c195f",
        //   "feePpm": 0,
        //   "tokenIn": {
        //     "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        //     "decimals": 18
        //   },
        //   "tokenOut": {
        //     "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
        //     "decimals": 18
        //   },
        //   "side": "exactIn",
        //   "amount": "50000000000000000",
        //   "blockTag": "latest",
        //   "quoteSource": "camelot-v3-quoter"
        // }
      ],
    },
  },
];

export const BotsListStab = [...BotsListSourceStab].map(
  (botsRule: IBotsRule) => {
    let pairsToQuote;
    if (botsRule.jobParams.jobType === IJobType.GET_ARBITRUM_QUOTES_MULTI) {
      pairsToQuote = botsRule.jobParams.pairsToQuote.map((quote: IQuote) => {
        return {
          ...quote,
          quoteSource:
            quote.version === 'v2' ? 'uniswap-v2-router' : quote.quoteSource,
        };
      });
    }
    return {
      ...botsRule,
      jobParams: {
        ...botsRule.jobParams,
        pairsToQuote,
      },
    };
  },
);

export const BotsListReplacedStab: IBotsRule[] = [
  {
    id: '1',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: false,
      isRepeat: true,
      delayBetweenRepeat: 10,
      maxJobs: 1,
      maxErrors: 100,
      timeoutMs: 1000,
    },
    jobParams: {
      jobType: IJobType.GET_ARB_EXECUTOR_QUOTES,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      stepPrefundPct: 2,
      pairsToQuote: [
        {
          dex: 'uniswap',
          version: 'v2',
          token0: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          token1: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          poolAddress: '0x103b03051bf073c44decfaf8dfd12275254ab97e',
          feePpm: 3000,
          tokenIn: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          tokenOut: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          side: 'exactIn',
          amount: '50000000000000000',
          blockTag: 'latest',
          quoteSource: 'uniswap-v2-router',
        },

        {
          dex: 'sushi',
          version: 'v2',
          token0: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          token1: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          poolAddress: '0xbf6cbb1f40a542af50839cad01b0dc1747f11e18',
          feePpm: 3000,
          tokenIn: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          tokenOut: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          side: 'exactIn',
          amount: '50000000000000000',
          blockTag: 'latest',
          quoteSource: 'uniswap-v2-router',
        },

        // 55076690214033331691n
        // 2917352912628969n

        // amountIn: 53983436880494611833n,
        // amountOut: 2999407125182626n,

        // {
        //   "dex": "camelot",
        //   "version": "v2",
        //   "token0": {
        //     "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        //     "decimals": 18
        //   },
        //   "token1": {
        //     "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
        //     "decimals": 18
        //   },
        //   "poolAddress": "0xa6c5c7d189fa4eb5af8ba34e63dcdd3a635d433f",
        //   "feePpm": 3000,
        //   "tokenIn": {
        //     "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        //     "decimals": 18
        //   },
        //   "tokenOut": {
        //     "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
        //     "decimals": 18
        //   },
        //   "side": "exactIn",
        //   "amount": "50000000000000000",
        //   "blockTag": "latest",
        //   "quoteSource": "uniswap-v2-router"
        // },

        {
          dex: 'uniswap',
          version: 'v3',
          token0: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          token1: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          poolAddress: '0x89a4026e9ade251c67b7fb38054931a39936d9c5',
          feePpm: 100,
          tokenIn: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          tokenOut: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          side: 'exactIn',
          amount: '50000000000000000',
          blockTag: 'latest',
          quoteSource: 'quoteBothBase',
        },

        {
          dex: 'sushi',
          version: 'v3',
          token0: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          token1: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          poolAddress: '0x011cc642ae74315001eeb541c1d2d225e92ece3d',
          feePpm: 100,
          tokenIn: {
            address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
            decimals: 18,
          },
          tokenOut: {
            address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
            decimals: 18,
          },
          side: 'exactIn',
          amount: '50000000000000000',
          blockTag: 'latest',
          quoteSource: 'quoteBothBase',
        },

        // {
        //   "dex": "camelot",
        //   "version": "v3",
        //   "token0": {
        //     "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        //     "decimals": 18
        //   },
        //   "token1": {
        //     "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
        //     "decimals": 18
        //   },
        //   "poolAddress": "0xe51635ae8136abac44906a8f230c2d235e9c195f",
        //   "feePpm": 0,
        //   "tokenIn": {
        //     "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        //     "decimals": 18
        //   },
        //   "tokenOut": {
        //     "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
        //     "decimals": 18
        //   },
        //   "side": "exactIn",
        //   "amount": "50000000000000000",
        //   "blockTag": "latest",
        //   "quoteSource": "camelot-v3-quoter"
        // }
      ],
    },
  },
];

export const BotList10: IBotsRule[] = [
  {
    id: '18',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: true,
      isRepeat: true,
      delayBetweenRepeat: 86400000,
      maxJobs: 10,
      maxErrors: 1000,
      timeoutMs: 15000000,
    },
    jobParams: {
      jobType: IJobType.GET_POOLS_RESERVES,
      rpcUrl: 'https://arb1.arbitrum.io',
      pairsToQuote: [],
      extraSettings: JSON.stringify({
        configDB: {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'user_secret',
          password: 'pass_secret',
          database: 'config_info_db',
        },
        configData: {
          version: 'v3',
        },
      }),
    },
  },
  {
    id: '17',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: true,
      isRepeat: true,
      delayBetweenRepeat: 86400000,
      maxJobs: 10,
      maxErrors: 1000,
      timeoutMs: 15000000,
    },
    jobParams: {
      jobType: IJobType.GET_POOLS_FROM_FACTORY,
      rpcUrl: 'https://arb1.arbitrum.io',
      pairsToQuote: [],
      extraSettings: JSON.stringify({
        configDB: {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'user_secret',
          password: 'pass_secret',
          database: 'config_info_db',
        },
        configData: {
          factoryAddress: '0x1a3C9B1d2F0529D97f2AfC5136Cc23E58f1FD35B',
          version: 'v3',
          dexId: 3,
          fee: 0,
          start: 1,
          finish: 66,
          dexName: 'camelot',
          chainId: 42161,
        },
      }),
    },
  },
  {
    id: '16',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: true,
      isRepeat: true,
      delayBetweenRepeat: 86400000,
      maxJobs: 10,
      maxErrors: 1000,
      timeoutMs: 15000000,
    },
    jobParams: {
      jobType: IJobType.GET_POOLS_FROM_FACTORY,
      rpcUrl: 'https://arb1.arbitrum.io',
      pairsToQuote: [],
      extraSettings: JSON.stringify({
        configDB: {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'user_secret',
          password: 'pass_secret',
          database: 'config_info_db',
        },
        configData: {
          factoryAddress: '0x1Af415A1EbA07A4986A52B6F2E7DE7003d82231E',
          version: 'v3',
          dexId: 2,
          fee: 0,
          start: 1,
          finish: null,
          dexName: 'sushiswap',
          chainId: 42161,
        },
      }),
    },
  },
  {
    id: '15',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: true,
      isRepeat: true,
      delayBetweenRepeat: 86400000,
      maxJobs: 10,
      maxErrors: 1000,
      timeoutMs: 15000000,
    },
    jobParams: {
      jobType: IJobType.GET_POOLS_FROM_FACTORY,
      rpcUrl: 'https://arb1.arbitrum.io',
      pairsToQuote: [],
      extraSettings: JSON.stringify({
        configDB: {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'user_secret',
          password: 'pass_secret',
          database: 'config_info_db',
        },
        configData: {
          factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
          version: 'v3',
          dexId: 1,
          fee: 0,
          start: 1,
          finish: null,
          dexName: 'uniswap',
          chainId: 42161,
        },
      }),
    },
  },
  {
    id: '14',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: true,
      isRepeat: true,
      delayBetweenRepeat: 86400000,
      maxJobs: 1000,
      maxErrors: 10,
      timeoutMs: 15000000,
    },
    jobParams: {
      jobType: IJobType.GET_POOLS_FROM_FACTORY,
      rpcUrl: 'https://arb1.arbitrum.io',
      pairsToQuote: [],
      extraSettings: JSON.stringify({
        configDB: {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'user_secret',
          password: 'pass_secret',
          database: 'lastBlockNumber',
        },
        configData: {
          factoryAddress: '0x6EcCab422D763AC031210895C81787E87B43A652',
          version: 'v2',
          dexId: 3,
          fee: 3000,
          start: 1,
          finish: null,
          dexName: 'camelot',
          chainId: 42161,
        },
      }),
    },
  },
  {
    id: '13',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: true,
      isRepeat: true,
      delayBetweenRepeat: 86400000,
      maxJobs: 1000,
      maxErrors: 10,
      timeoutMs: 15000000,
    },
    jobParams: {
      jobType: IJobType.GET_POOLS_FROM_FACTORY,
      rpcUrl: 'https://arb1.arbitrum.io',
      pairsToQuote: [],
      extraSettings: JSON.stringify({
        configDB: {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'user_secret',
          password: 'pass_secret',
          database: 'config_info_db',
        },
        configData: {
          factoryAddress: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
          version: 'v2',
          dexId: 2,
          fee: 3000,
          start: 1,
          finish: null,
          dexName: 'sushiswap',
          chainId: 42161,
        },
      }),
    },
  },
  {
    id: '12',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: true,
      isRepeat: true,
      delayBetweenRepeat: 86400000,
      maxJobs: 1000,
      maxErrors: 10,
      timeoutMs: 15000000,
    },
    jobParams: {
      jobType: IJobType.GET_POOLS_FROM_FACTORY,
      rpcUrl: 'https://arb1.arbitrum.io',
      pairsToQuote: [],
      extraSettings: JSON.stringify({
        configDB: {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'user_secret',
          password: 'pass_secret',
          database: 'config_info_db',
        },
        configData: {
          factoryAddress: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
          version: 'v2',
          dexId: 1,
          fee: 3000,
          start: 1,
          finish: 44,
          dexName: 'uniswap',
          chainId: 42161,
        },
      }),
    },
  },
];
