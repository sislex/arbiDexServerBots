import {IBotsRule, IBotType, IJobType, IPool} from '../state.types';
// export const BotList10: IBotsRule[] = [
//   {
//     "id": "Binance_USDC_WETH",
//     "botParams": {
//       "botType": IBotType.TEST_BOT,
//       "paused": false,
//       "isRepeat": true,
//       delayBetweenRepeat: 200,
//       maxJobs: 1000000,
//       maxErrors: 100,
//       timeoutMs: 30000,
//     },
//     "jobParams": {
//       "jobType": IJobType.GET_CEX_QUOTES,
//       "source": "binance",
//       "token0": "ETH",
//       "token1": "USDC",
//     }
//   },
//   {
//     "id": "Mexc_USDT_WETH",
//     "botParams": {
//       "botType": IBotType.TEST_BOT,
//       "paused": false,
//       "isRepeat": true,
//       delayBetweenRepeat: 200,
//       maxJobs: 1000000,
//       maxErrors: 100,
//       timeoutMs: 30000,
//     },
//     "jobParams": {
//       "jobType": IJobType.GET_CEX_QUOTES,
//       "source": "mexc",
//       "token0": "ETH",
//       "token1": "USDT",
//     }
//   },
//   {
//     "id": "Bybit_USDT_WETH",
//     "botParams": {
//       "botType": IBotType.TEST_BOT,
//       "paused": false,
//       "isRepeat": true,
//       delayBetweenRepeat: 200,
//       maxJobs: 1000000,
//       maxErrors: 100,
//       timeoutMs: 30000,
//     },
//     "jobParams": {
//       "jobType": IJobType.GET_CEX_QUOTES,
//       "source": "bybit",
//       "token0": "ETH",
//       "token1": "USDT",
//     }
//   },
//   {
//     "id": "OKX_USDT_WETH",
//     "botParams": {
//       "botType": IBotType.TEST_BOT,
//       "paused": false,
//       "isRepeat": true,
//       delayBetweenRepeat: 200,
//       maxJobs: 1000000,
//       maxErrors: 100,
//       timeoutMs: 30000,
//     },
//     "jobParams": {
//       "jobType": IJobType.GET_CEX_QUOTES,
//       "source": "okx",
//       "token0": "ETH",
//       "token1": "USDT",
//     }
//   },
//   {
//     "id": "KuCoin_USDT_WETH",
//     "botParams": {
//       "botType": IBotType.TEST_BOT,
//       "paused": false,
//       "isRepeat": true,
//       delayBetweenRepeat: 200,
//       maxJobs: 1000000,
//       maxErrors: 100,
//       timeoutMs: 30000,
//     },
//     "jobParams": {
//       "jobType": IJobType.GET_CEX_QUOTES,
//       "source": "kucoin",
//       "token0": "ETH",
//       "token1": "USDT",
//     }
//   },
//   {
//     "id": "GateIO_USDT_WETH",
//     "botParams": {
//       "botType": IBotType.TEST_BOT,
//       "paused": false,
//       "isRepeat": true,
//       delayBetweenRepeat: 200,
//       maxJobs: 1000000,
//       maxErrors: 100,
//       timeoutMs: 30000,
//     },
//     "jobParams": {
//       "jobType": IJobType.GET_CEX_QUOTES,
//       "source": "gateio",
//       "token0": "ETH",
//       "token1": "USDT",
//     }
//   },
//   {
//     "id": "Dzengi_USDT_WETH",
//     "botParams": {
//       "botType": IBotType.TEST_BOT,
//       "paused": false,
//       "isRepeat": true,
//       delayBetweenRepeat: 200,
//       maxJobs: 1000000,
//       maxErrors: 100,
//       timeoutMs: 30000,
//     },
//     "jobParams": {
//       "jobType": IJobType.GET_CEX_QUOTES,
//       "source": "dzengi",
//       "token0": "ETH",
//       "token1": "USDT",
//     }
//   },
//   {
//     "id": "Arbitrum_USDC_WETH",
//     "botParams": {
//       "botType": IBotType.TEST_BOT,
//       "paused": false,
//       "isRepeat": true,
//       delayBetweenRepeat: 500,
//       maxJobs: 1000000,
//       maxErrors: 100,
//       timeoutMs: 30000,
//     },
//     "jobParams": {
//       "jobType": IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER,
//       "source": "dex:arbitrum",
//       "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//       "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//       "rpcUrl": "https://arb-mainnet.g.alchemy.com/v2/_T_Qkk4fOdQ7jQbGjSW2F",
//       "stepPrefundPct": 2,
//       "pairsToQuote": [
//         {
//           "dex": "pancake",
//           "version": "v3",
//           "poolAddress": "0xbedb464ef776fe208e3f2b5c0bafbe7983ef49db",
//           "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//           "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//           "feePpm": 10000
//         },
//         {
//           "dex": "pancake",
//           "version": "v3",
//           "poolAddress": "0x7fcdc35463e3770c2fb992716cd070b63540b947",
//           "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//           "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//           "feePpm": 100
//         },
//         {
//           "dex": "pancake",
//           "version": "v3",
//           "poolAddress": "0xb3d494d53aac707c469318f15cfd5d7857a61388",
//           "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//           "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//           "feePpm": 2500
//         },
//         {
//           "dex": "pancake",
//           "version": "v3",
//           "poolAddress": "0xd9e2a1a61b6e61b275cec326465d417e52c1b95c",
//           "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//           "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//           "feePpm": 500
//         },
//         {
//           "dex": "camelot",
//           "version": "v3",
//           "poolAddress": "0xb1026b8e7276e7ac75410f1fcbbe21796e8f7526",
//           "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//           "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//           "feePpm": 0
//         },
//         {
//           "dex": "sushi",
//           "version": "v3",
//           "poolAddress": "0xb658ee5c63922d2852f24458effa2bfa2cba3574",
//           "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//           "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//           "feePpm": 100
//         },
//         {
//           "dex": "sushi",
//           "version": "v3",
//           "poolAddress": "0x0ed17087175a677c05328a37b9795728e9cd8821",
//           "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//           "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//           "feePpm": 10000
//         },
//         {
//           "dex": "sushi",
//           "version": "v3",
//           "poolAddress": "0xc96525298419f7e00da8826b733ee52e271662b5",
//           "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//           "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//           "feePpm": 3000
//         },
//         {
//           "dex": "sushi",
//           "version": "v3",
//           "poolAddress": "0xf3eb87c1f6020982173c908e7eb31aa66c1f0296",
//           "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//           "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//           "feePpm": 500
//         },
//         {
//           "dex": "uniswap",
//           "version": "v3",
//           "poolAddress": "0x42fc852a750ba93d5bf772ecdc857e87a86403a9",
//           "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//           "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//           "feePpm": 10000
//         },
//         {
//           "dex": "uniswap",
//           "version": "v3",
//           "poolAddress": "0x6f38e884725a116c9c7fbf208e79fe8828a2595f",
//           "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//           "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//           "feePpm": 100
//         },
//         {
//           "dex": "uniswap",
//           "version": "v3",
//           "poolAddress": "0xc6962004f452be9203591991d15f6b388e09e8d0",
//           "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//           "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//           "feePpm": 500
//         },
//         {
//           "dex": "uniswap",
//           "version": "v3",
//           "poolAddress": "0xc473e2aee3441bf9240be85eb122abb059a3b57c",
//           "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//           "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
//           "feePpm": 3000
//         },
//       ] as IPool[]
//     }
//   },
// ];
export const BotList10: IBotsRule[] = [
  // {
  //   "id": "168",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 250,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "source": "dex:arbitrum",
  //     "jobType": IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER,
  //     "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //     "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //     "rpcUrl": "https://arb-mainnet.g.alchemy.com/v2/_T_Qkk4fOdQ7jQbGjSW2F",
  //     "stepPrefundPct": 2,
  //     "pairsToQuote": [
  //       {
  //         "dex": "pancake",
  //         "version": "v3",
  //         "poolAddress": "0x0bacc7a9717e70ea0da5ac075889bd87d4c81197",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 500
  //       },
  //       {
  //         "dex": "pancake",
  //         "version": "v3",
  //         "poolAddress": "0xaeab1336efc2bf74bc89fcf0e33e6013f3c8587e",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 2500
  //       },
  //       {
  //         "dex": "pancake",
  //         "version": "v3",
  //         "poolAddress": "0x5b7dd61f102280c6c121650e328f1e9f0af2543f",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 10000
  //       },
  //       {
  //         "dex": "pancake",
  //         "version": "v3",
  //         "poolAddress": "0x389938cf14be379217570d8e4619e51fbdafaa21",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 100
  //       },
  //       // {
  //       //   "dex": "pancake",
  //       //   "version": "v2",
  //       //   "poolAddress": "0x630388b8a8d22bb401e0c6a91c3a7956535cb30e",
  //       //   "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //       //   "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //       //   "feePpm": 3000
  //       // },
  //       {
  //         "dex": "camelot",
  //         "version": "v3",
  //         "poolAddress": "0x7cccba38e2d959fe135e79aebb57ccb27b128358",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 0
  //       },
  //       {
  //         "dex": "camelot",
  //         "version": "v2",
  //         "poolAddress": "0x97b192198d164c2a1834295e302b713bc32c8f1d",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 3000
  //       },
  //       {
  //         "dex": "sushi",
  //         "version": "v3",
  //         "poolAddress": "0x824d9bc425c599f46c700afdcae0867596f48ce2",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 100
  //       },
  //       {
  //         "dex": "sushi",
  //         "version": "v3",
  //         "poolAddress": "0x7f9061b253545103b80698e579c9891718057dfc",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 10000
  //       },
  //       {
  //         "dex": "sushi",
  //         "version": "v3",
  //         "poolAddress": "0x92d543a8a158a6bc2c7018ae17803819cb9150b2",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 3000
  //       },
  //       {
  //         "dex": "sushi",
  //         "version": "v3",
  //         "poolAddress": "0x96ada81328abce21939a51d971a63077e16db26e",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 500
  //       },
  //       {
  //         "dex": "sushi",
  //         "version": "v2",
  //         "poolAddress": "0xcb0e5bfa72bbb4d16ab5aa0c60601c438f04b4ad",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 3000
  //       },
  //       {
  //         "dex": "uniswap",
  //         "version": "v3",
  //         "poolAddress": "0x42161084d0672e1d3f26a9b53e653be2084ff19c",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 100
  //       },
  //       {
  //         "dex": "uniswap",
  //         "version": "v3",
  //         "poolAddress": "0x58039203442c9f2a45d5536bd021a383c7f3035c",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 10000
  //       },
  //       {
  //         "dex": "uniswap",
  //         "version": "v3",
  //         "poolAddress": "0x641c00a822e8b671738d32a431a4fb6074e5c79d",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 500
  //       },
  //       {
  //         "dex": "uniswap",
  //         "version": "v3",
  //         "poolAddress": "0xc82819f72a9e77e2c0c3a69b3196478f44303cf4",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 3000
  //       },
  //       {
  //         "dex": "uniswap",
  //         "version": "v2",
  //         "poolAddress": "0xd04bc65744306a5c149414dd3cd5c984d9d3470d",
  //         "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //         "token1": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //         "feePpm": 3000
  //       }
  //     ] as IPool[]
  //   }
  // },
  // {
  //   "id": "159",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 200,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "jobType": IJobType.GET_CEX_QUOTES,
  //     "source": "gateio",
  //     "token0": "ETH",
  //     "token1": "USDC"
  //   }
  // },
  // {
  //   "id": "158",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 200,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "jobType": IJobType.GET_CEX_QUOTES,
  //     "source": "kucoin",
  //     "token0": "ETH",
  //     "token1": "USDC"
  //   }
  // },
  // {
  //   "id": "157",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 200,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "jobType": IJobType.GET_CEX_QUOTES,
  //     "source": "okx",
  //     "token0": "ETH",
  //     "token1": "USDC"
  //   }
  // },
  // {
  //   "id": "156",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 200,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "jobType": IJobType.GET_CEX_QUOTES,
  //     "source": "bybit",
  //     "token0": "ETH",
  //     "token1": "USDC"
  //   }
  // },
  // {
  //   "id": "155",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 200,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "jobType": IJobType.GET_CEX_QUOTES,
  //     "source": "mexc",
  //     "token0": "ETH",
  //     "token1": "USDC"
  //   }
  // },
  // {
  //   "id": "146",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 200,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "jobType": IJobType.GET_CEX_QUOTES,
  //     "source": "dzengi",
  //     "token0": "ETH",
  //     "token1": "USDT"
  //   }
  // },
  // {
  //   "id": "145",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 200,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "jobType": IJobType.GET_CEX_QUOTES,
  //     "source": "binance",
  //     "token0": "ETH",
  //     "token1": "USDT"
  //   }
  // },
  // {
  //   "id": "55",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 200,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "jobType": IJobType.GET_CEX_QUOTES,
  //     "source": "gateio",
  //     "token0": "ETH",
  //     "token1": "USDT"
  //   }
  // },
  // {
  //   "id": "54",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 200,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "jobType": IJobType.GET_CEX_QUOTES,
  //     "source": "kucoin",
  //     "token0": "ETH",
  //     "token1": "USDT"
  //   }
  // },
  // {
  //   "id": "53",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 200,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "jobType": IJobType.GET_CEX_QUOTES,
  //     "source": "okx",
  //     "token0": "ETH",
  //     "token1": "USDT"
  //   }
  // },
  // {
  //   "id": "52",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 200,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "jobType": IJobType.GET_CEX_QUOTES,
  //     "source": "bybit",
  //     "token0": "ETH",
  //     "token1": "USDT"
  //   }
  // },
  // {
  //   "id": "26",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 200,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "jobType": IJobType.GET_CEX_QUOTES,
  //     "source": "mexc",
  //     "token0": "ETH",
  //     "token1": "USDT"
  //   }
  // },
  // {
  //   "id": "25",
  //   "botParams": {
  //     "botType": IBotType.TEST_BOT,
  //     "paused": false,
  //     "isRepeat": true,
  //     "delayBetweenRepeat": 200,
  //     "maxJobs": 1000000,
  //     "maxErrors": 100,
  //     "timeoutMs": 30000
  //   },
  //   "jobParams": {
  //     "jobType": IJobType.GET_CEX_QUOTES,
  //     "source": "binance",
  //     "token0": "ETH",
  //     "token1": "USDC"
  //   }
  // }
];


