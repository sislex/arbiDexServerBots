import {IBotsRule, IBotType, IJobType, IPairToQuote, IQuote} from '../state.types';

export const BotList10: IBotsRule[] = [
  {
    "id": "1",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      delayBetweenRepeat: 100,
      maxJobs: 10000,
      maxErrors: 100,
      timeoutMs: 3000,
    },
    "jobParams": {
      "jobType": IJobType.GET_ARB_EXECUTOR_QUOTES,
      "rpcUrl": "https://arb-mainnet.g.alchemy.com/v2/_T_Qkk4fOdQ7jQbGjSW2F",
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
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "poolAddress": "0xf64dfe17c8b87f012fcf50fbda1d62bfa148366a",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },
        {
          "dex": "uniswap",
          "version": "v2",
          "token0": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0x8c1d83a25ee2da1643a5d937562682b1ac6c856b",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
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
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0x515e252b2b5c22b4b2b6df66c2ebeea871aa4d69",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
            "decimals": 18
          },
          "poolAddress": "0xfca2b3892435c4d5b5e0e0e04312022ece647fa2",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
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
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
            "decimals": 18
          },
          "poolAddress": "0xf4a6c89e06318717657d352d16cfc7739d9a8b85",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },
        {
          "dex": "uniswap",
          "version": "v2",
          "token0": {
            "address": "0x6491c05a82219b8d1479057361ff1654749b876b",
            "decimals": 18
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0xae2e9ac7c17decbbe784c07fd4be3687c24b6b6b",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x6491c05a82219b8d1479057361ff1654749b876b",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
            "decimals": 18
          },
          "poolAddress": "0xf20d0f11e164b51ce3f98be39882fb28047bc468",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
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
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
            "decimals": 18
          },
          "poolAddress": "0x7050a8908e2a60899d8788015148241f0993a3fd",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
            "decimals": 18
          },
          "poolAddress": "0x468b88941e7cc0b88c1869d68ab6b570bcef62ff",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
            "decimals": 18
          },
          "poolAddress": "0x22127577d772c4098c160b49a8e5cae3012c5824",
          "feePpm": 10000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
            "decimals": 18
          },
          "poolAddress": "0x91308bc9ce8ca2db82aa30c65619856cc939d907",
          "feePpm": 500,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
            "decimals": 18
          },
          "poolAddress": "0xd49ab568db5721afe8e86811ff4d0d5f5afea300",
          "feePpm": 100,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
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
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
            "decimals": 18
          },
          "poolAddress": "0x55a7e0ab34038d75d0e2118254fd84fdedcd4e65",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
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
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
            "decimals": 18
          },
          "poolAddress": "0x942e53ed315db6451adcd601d4d08f059f88c77f",
          "feePpm": 500,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
            "decimals": 8
          },
          "poolAddress": "0xa18b5b85cb9edd12adf8ce0105888ce7f41ebd92",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
            "decimals": 8
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
            "decimals": 8
          },
          "poolAddress": "0x15811145e3f1ab23b28582556fcba20df5642876",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
            "decimals": 8
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
            "decimals": 8
          },
          "poolAddress": "0xb48b15861f9c5b513690fad7240d741cb40798de",
          "feePpm": 500,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
            "decimals": 8
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
          "amount": "30000000000000000",
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
          "amount": "30000000000000000",
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
          "amount": "30000000000000000",
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
          "amount": "30000000000000000",
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
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "token0": {
            "address": "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34",
            "decimals": 18
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0x9511ee80843cdf8ecfa0337c73621458a8ca1c73",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "token0": {
            "address": "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34",
            "decimals": 18
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0xaa9aea1896130089a8fc33acd7028dbaeba421d8",
          "feePpm": 500,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34",
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
            "address": "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34",
            "decimals": 18
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0x54a73446ad34d8d4ded1f1dbaa14b442279be747",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
            "decimals": 18
          },
          "poolAddress": "0x92fd143a8fa0c84e016c2765648b9733b0aa519e",
          "feePpm": 10000,
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
          "poolAddress": "0x92c63d0e701caae670c9415d91c474f686298f00",
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
          "poolAddress": "0xc6f780497a95e246eb9449f5e4770916dcd6396a",
          "feePpm": 500,
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
          "poolAddress": "0xb3942c9ffa04efbc1fa746e146be7565c76e3dc1",
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
          "version": "v3",
          "token0": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "token1": {
            "address": "0x912ce59144191c1204e64559fe8253a0e49e6548",
            "decimals": 18
          },
          "poolAddress": "0x99543bf98ca1830aa20d3eb12c1b9962f8eadc11",
          "feePpm": 500,
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
          "poolAddress": "0xb1674e700f0dcff2f7b4bfc68cb6d9dea7ddbb2e",
          "feePpm": 10000,
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
        {
          "dex": "uniswap",
          "version": "v3",
          "token0": {
            "address": "0x6491c05a82219b8d1479057361ff1654749b876b",
            "decimals": 18
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0xdaf6ac479284deccc8d58e9a7792c0a0ba702a4b",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x6491c05a82219b8d1479057361ff1654749b876b",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
            "decimals": 18
          },
          "poolAddress": "0xc24f7d8e51a64dc1238880bd00bb961d54cbeb29",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
            "decimals": 18
          },
          "poolAddress": "0x929fcf81102c5577243ee614c2c455acd6681f1a",
          "feePpm": 10000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
            "decimals": 18
          },
          "poolAddress": "0xff96d42dc8e2700abab1f1f82ecf699caa1a2056",
          "feePpm": 500,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
            "decimals": 18
          },
          "poolAddress": "0x25857f9150515696a97687ebec20601139ad4fa1",
          "feePpm": 100,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
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
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
            "decimals": 18
          },
          "poolAddress": "0x8e1881dc184a93e36be6b79ca0de22e5db779b54",
          "feePpm": 100,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
            "decimals": 18
          },
          "side": "exactIn",
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "token0": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0x149e36e72726e0bcea5c59d40df2c43f60f5a22d",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
          },
          "side": "exactIn",
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "token0": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0x99dfc0126ed31e0169fc32db6b89adf9fee9a77e",
          "feePpm": 10000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
          },
          "side": "exactIn",
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },
        {
          "dex": "uniswap",
          "version": "v3",
          "token0": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0x2f5e87c9312fa29aed5c179e456625d79015299c",
          "feePpm": 500,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
          },
          "side": "exactIn",
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },




        {
          "dex": "uniswap",
          "version": "v3",
          "token0": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0x03a3be7ab4aa263d42d63b6cc594f4fb3d3f3951",
          "feePpm": 100,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
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
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0xf79099596045a41bb2ae53fa6677576687242455",
          "feePpm": 500,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
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
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0x6f10667f314498649eb2f80da244e8c6e9f031d5",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
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
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
          },
          "token1": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "poolAddress": "0xbb08872aec88fa7bcda9faadccee8bfa806414f8",
          "feePpm": 100,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "decimals": 8
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
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "poolAddress": "0xf3eb87c1f6020982173c908e7eb31aa66c1f0296",
          "feePpm": 500,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
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
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "poolAddress": "0xc96525298419f7e00da8826b733ee52e271662b5",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
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
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "poolAddress": "0x0ed17087175a677c05328a37b9795728e9cd8821",
          "feePpm": 10000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
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
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "poolAddress": "0xb658ee5c63922d2852f24458effa2bfa2cba3574",
          "feePpm": 100,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "poolAddress": "0xc473e2aee3441bf9240be85eb122abb059a3b57c",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "poolAddress": "0xc6962004f452be9203591991d15f6b388e09e8d0",
          "feePpm": 500,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "poolAddress": "0x6f38e884725a116c9c7fbf208e79fe8828a2595f",
          "feePpm": 100,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "30000000000000000",
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
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "poolAddress": "0x42fc852a750ba93d5bf772ecdc857e87a86403a9",
          "feePpm": 10000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },

        {
          "dex": "camelot",
          "version": "v2",
          "token0": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "token1": {
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "poolAddress": "0x54b26faf3671677c19f70c4b879a6f7b898f732c",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "side": "exactIn",
          "amount": "30000000000000000",
          "blockTag": "latest",
          "quoteSource": "quoteBothBase"
        },
        {
          "dex": "camelot",
          "version": "v3",
          "token0": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "token1": {
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
          },
          "poolAddress": "0xb1026b8e7276e7ac75410f1fcbbe21796e8f7526",
          "feePpm": 3000,
          "tokenIn": {
            "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "decimals": 18
          },
          "tokenOut": {
            "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            "decimals": 6
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

export const BotListFiltered: IBotsRule[] =  BotList10.map((bot:IBotsRule) => {
  const botFiltered = {
    ...bot,
    jobParams: {
      ...bot.jobParams,
    }
  }

  if (botFiltered.jobParams.jobType === IJobType.GET_ARB_EXECUTOR_QUOTES) {

    // Step 1: убираем проблемные пулы (revert, огромный газ и т.д.)
    const  _blacklistFiltered = botFiltered.jobParams.pairsToQuote.filter((pair: IPairToQuote) => {
      return !(
        pair.poolAddress!.toLowerCase() === '0x8e1881dc184a93e36be6b79ca0de22e5db779b54'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xd49ab568db5721afe8e86811ff4d0d5f5afea300'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x824d9bc425c599f46c700afdcae0867596f48ce2'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xaa9aea1896130089a8fc33acd7028dbaeba421d8'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x25857f9150515696a97687ebec20601139ad4fa1'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x011cc642ae74315001eeb541c1d2d225e92ece3d'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xb48b15861f9c5b513690fad7240d741cb40798de'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x22127577d772c4098c160b49a8e5cae3012c5824'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xb1674e700f0dcff2f7b4bfc68cb6d9dea7ddbb2e'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x54a73446ad34d8d4ded1f1dbaa14b442279be747'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x942e53ed315db6451adcd601d4d08f059f88c77f'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x92d543a8a158a6bc2c7018ae17803819cb9150b2'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x9511eE80843CDf8ECfA0337c73621458a8ca1C73'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xdaf6ac479284deccc8d58e9a7792c0a0ba702a4b'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x8701E62C7fa59CbA162d269b07b411581F1d2fc1'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x89A4026E9aDE251C67b7fb38054931a39936D9C5'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xf79099596045a41bb2ae53fa6677576687242455'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xbb08872AeC88fa7BCDa9faaDccEe8bfA806414f8'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xB658eE5c63922d2852f24458efFA2Bfa2cBA3574'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xC96525298419f7E00dA8826B733Ee52e271662b5'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x0ed17087175A677C05328a37B9795728E9Cd8821'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x7F9061b253545103b80698e579C9891718057Dfc'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xf20d0f11e164b51ce3f98be39882fb28047bc468'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xa18b5b85cb9edd12adf8ce0105888ce7f41ebd92'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xfca2b3892435c4d5b5e0e0e04312022ece647fa2'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x99543bF98Ca1830Aa20d3Eb12c1b9962f8eaDC11'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xf4a6c89e06318717657d352d16cfc7739d9a8b85'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0xff96D42dc8E2700ABAb1f1F82Ecf699caA1a2056'.toLowerCase()
        || pair.poolAddress!.toLowerCase() === '0x55A7E0ab34038D75d0E2118254Fd84FdedCd4E65'.toLowerCase()
      );
    });

    // Step 2: убираем пары tokenIn/tokenOut которые встречаются только 1 раз (для арбитража нужно минимум 2 пула в паре)
    const _pairCount = new Map<string, number>();
    for (const p of _blacklistFiltered) {
      const key = p.tokenIn.address.toLowerCase() + '-' + p.tokenOut.address.toLowerCase();
      _pairCount.set(key, (_pairCount.get(key) || 0) + 1);
    }

    botFiltered.jobParams.pairsToQuote = _blacklistFiltered.filter((p) => {
      const key = p.tokenIn.address.toLowerCase() + '-' + p.tokenOut.address.toLowerCase();
      return (_pairCount.get(key) || 0) >= 2;
    });



    // botFiltered.jobParams.pairsToQuote = [
    //   ...botFiltered.jobParams.pairsToQuote,
    // ];


  }

  return botFiltered;
});

export  const CamelotConfigPools = [
  {
    "dex": "camelot",
    "version": "v2",
    "token0": {
      "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      "decimals": 18
    },
    "token1": {
      "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      "decimals": 6
    },
    "poolAddress": "0x54b26faf3671677c19f70c4b879a6f7b898f732c",
    "feePpm": 3000,
    "tokenIn": {
      "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      "decimals": 18
    },
    "tokenOut": {
      "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      "decimals": 6
    },
    "side": "exactIn",
    "amount": "30000000000000000",
    "blockTag": "latest",
    "quoteSource": "quoteBothBase"
  },
  {
    "dex": "camelot",
    "version": "v3",
    "token0": {
      "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      "decimals": 18
    },
    "token1": {
      "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      "decimals": 6
    },
    "poolAddress": "0xb1026b8e7276e7ac75410f1fcbbe21796e8f7526",
    "feePpm": 3000,
    "tokenIn": {
      "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      "decimals": 18
    },
    "tokenOut": {
      "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      "decimals": 6
    },
    "side": "exactIn",
    "amount": "30000000000000000",
    "blockTag": "latest",
    "quoteSource": "quoteBothBase"
  },
];

