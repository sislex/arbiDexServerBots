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
        "jobType": IJobType.GET_ARB_EXECUTOR_QUOTES,
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
            "amount": "50000000000000000",
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
            "amount": "50000000000000000",
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
            "amount": "50000000000000000",
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
            "amount": "50000000000000000",
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
      "jobType": IJobType.GET_ARB_EXECUTOR_QUOTES,
      "rpcUrl": "https://arb1.arbitrum.io/rpc",
      "stepPrefundPct": 2,
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
          "amount": "50000000000000000",
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
          "amount": "50000000000000000",
          "blockTag": "latest",
          "quoteSource": "uniswap-v2-router"
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
          "amount": "50000000000000000",
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
          "amount": "50000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
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

      ]
    }
  }
];

export const BotList10: IBotsRule[] = [
  {
    "id": "1",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      delayBetweenRepeat: 4000,
      maxJobs: 1,
      maxErrors: 100,
      timeoutMs: 1000,
    },
    "jobParams": {
      "jobType": IJobType.GET_ARB_EXECUTOR_QUOTES,
      "rpcUrl": "https://arb1.arbitrum.io/rpc",
      "stepPrefundPct": 2,
      "pairsToQuote": [
        {
          "dex": "sushi",
          "version": "v3",
          "token0": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "token1": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "poolAddress": "0x824d9bc425c599f46c700afdcae0867596f48ce2",
          "feePpm": 100,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "50000000000000000",
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
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "poolAddress": "0x7f9061b253545103b80698e579c9891718057dfc",
          "feePpm": 10000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "50000000000000000",
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
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "poolAddress": "0x92d543a8a158a6bc2c7018ae17803819cb9150b2",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "50000000000000000",
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
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "poolAddress": "0x96ada81328abce21939a51d971a63077e16db26e",
          "feePpm": 500,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "50000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "token0": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "token1": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "poolAddress": "0x42161084d0672e1d3f26a9b53e653be2084ff19c",
          "feePpm": 100,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "50000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "token0": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "token1": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "poolAddress": "0x58039203442c9f2a45d5536bd021a383c7f3035c",
          "feePpm": 10000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "50000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "token0": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "token1": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "poolAddress": "0x641c00a822e8b671738d32a431a4fb6074e5c79d",
          "feePpm": 500,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "50000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "token0": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "token1": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "poolAddress": "0xc82819f72a9e77e2c0c3a69b3196478f44303cf4",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "50000000000000000",
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
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "poolAddress": "0xcb0e5bfa72bbb4d16ab5aa0c60601c438f04b4ad",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "50000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },
        {
          "dex": "uniswap",
          "version": "v2",
          "token0": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "token1": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "poolAddress": "0xd04bc65744306a5c149414dd3cd5c984d9d3470d",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "50000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        }
      ]
    }
  }
];
