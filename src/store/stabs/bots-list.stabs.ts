import {IBotsRule, IBotType, IJobType, IPair, IQuote} from '../state.types';

export const BotsListSourceStab: IBotsRule[] = [
    {
      "id": "1",
      "botParams": {
        "botType": IBotType.TEST_BOT,
        "paused": false,
        "isRepeat": true,
        delayBetweenRepeat: 10,
        maxJobs: 1,
        maxErrors: 100,
        timeoutMs: 1000,
      },
      "jobParams": {
        "jobType": IJobType.GET_ARBITRUM_QUOTES_MULTI,
        "rpcUrl": "https://arb1.arbitrum.io/rpc",
        "pairsToQuote": [
          {
            "dex": "uniswap",
            "version": "v2",
            "token0": {
              "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
              "decimals": 18
            },
            "token1": {
              "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
              "decimals": 18
            },
            "poolAddress": "0x103b03051bf073c44decfaf8dfd12275254ab97e",
            "feePpm": 3000,
            "tokenIn": {
              "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
              "decimals": 18
            },
            "tokenOut": {
              "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
              "decimals": 18
            },
            "side": "exactIn",
            "amount": "30000000000000000",
            "blockTag": "latest",
            "quoteSource": "quoteBothBase"
          },
          {
            "dex": "sushi",
            "version": "v2",
            "token0": {
              "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
              "decimals": 18
            },
            "token1": {
              "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
              "decimals": 18
            },
            "poolAddress": "0xbf6cbb1f40a542af50839cad01b0dc1747f11e18",
            "feePpm": 3000,
            "tokenIn": {
              "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
              "decimals": 18
            },
            "tokenOut": {
              "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
              "decimals": 18
            },
            "side": "exactIn",
            "amount": "30000000000000000",
            "blockTag": "latest",
            "quoteSource": "uniswap-v2-router"
          },
          {
            "dex": "uniswap",
            "version": "v3",
            "token0": {
              "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
              "decimals": 18
            },
            "token1": {
              "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
              "decimals": 18
            },
            "poolAddress": "0x89a4026e9ade251c67b7fb38054931a39936d9c5",
            "feePpm": 100,
            "tokenIn": {
              "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
              "decimals": 18
            },
            "tokenOut": {
              "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
              "decimals": 18
            },
            "side": "exactIn",
            "amount": "30000000000000000",
            "blockTag": "latest",
            "quoteSource": "quoteBothBase"
          },
          {
            "dex": "sushi",
            "version": "v3",
            "token0": {
              "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
              "decimals": 18
            },
            "token1": {
              "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
              "decimals": 18
            },
            "poolAddress": "0x011cc642ae74315001eeb541c1d2d225e92ece3d",
            "feePpm": 100,
            "tokenIn": {


              "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
              "decimals": 18
            },
            "tokenOut": {
              "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
              "decimals": 18
            },
            "side": "exactIn",
            "amount": "30000000000000000",
            "blockTag": "latest",
            "quoteSource": "quoteBothBase"
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
          //   "amount": "30000000000000000",
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
          //   "amount": "30000000000000000",
          //   "blockTag": "latest",
          //   "quoteSource": "camelot-v3-quoter"
          // }
        ]
      }
    }
  ]

export const BotsListStab = [...BotsListSourceStab]
  .map((botsRule: IBotsRule) => {
    let pairsToQuote;
    if (botsRule.jobParams.jobType === IJobType.GET_ARBITRUM_QUOTES_MULTI) {
      pairsToQuote = botsRule.jobParams.pairsToQuote.map((quote: IQuote)=> {
        return {
          ...quote,
          quoteSource: quote.version === 'v2' ? 'uniswap-v2-router' : quote.quoteSource,
        }
      });
    }
    return {
      ...botsRule,
      jobParams: {
        ...botsRule.jobParams,
        pairsToQuote,
      },
    }
  });

export const BotsListReplacedStab: IBotsRule[] = [
  {
    "id": "1",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      delayBetweenRepeat: 10,
      maxJobs: 1,
      maxErrors: 100,
      timeoutMs: 1000,
    },
    "jobParams": {
      "jobType": IJobType.GET_ARBITRUM_QUOTES_MULTI,
      "rpcUrl": "https://arb1.arbitrum.io/rpc",
      "pairsToQuote": [

        {
          "dex": "uniswap",
          "version": "v2",
          "token0": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "token1": {
            "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
            "decimals": 18
          },
          "poolAddress": "0x103b03051bf073c44decfaf8dfd12275254ab97e",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "uniswap-v2-router"
        },

        {
          "dex": "sushi",
          "version": "v2",
          "token0": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "token1": {
            "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
            "decimals": 18
          },
          "poolAddress": "0xbf6cbb1f40a542af50839cad01b0dc1747f11e18",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "uniswap-v2-router"
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "token0": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "token1": {
            "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
            "decimals": 18
          },
          "poolAddress": "0x89a4026e9ade251c67b7fb38054931a39936d9c5",
          "feePpm": 100,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },

        {
          "dex": "sushi",
          "version": "v3",
          "token0": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "token1": {
            "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
            "decimals": 18
          },
          "poolAddress": "0x011cc642ae74315001eeb541c1d2d225e92ece3d",
          "feePpm": 100,
          "tokenIn": {


            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },

      ]
    }
  }
];
