import {IBotsRule, IBotType, IJobType, IPairToQuote, IQuote} from '../state.types';

export const BotList10: IBotsRule[] = [
  {
    id: '17',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: false,
      isRepeat: true,
      delayBetweenRepeat: 10000,
      maxJobs: 3,
      maxErrors: 10,
      timeoutMs: 1500,
    },
    jobParams: {
      jobType: IJobType.SET_QUOTES_GRAPH_DATA,
      rpcUrl: 'https://arb1.arbitrum.io',
      pairsToQuote: [],
      extraSettings: JSON.stringify({
        configDB: {
          type: 'postgres',
          host: 'localhost',
          port: 6543,
          username: 'user_secret',
          password: 'pass_secret',
          database: 'analytics_db',
        },
        configData: {
        },
      }),
    },
  },

  // {
  //   id: '17',
  //   botParams: {
  //     botType: IBotType.TEST_BOT,
  //     paused: false,
  //     isRepeat: true,
  //     delayBetweenRepeat: 86400000,
  //     maxJobs: 10,
  //     maxErrors: 1000,
  //     timeoutMs: 15000000,
  //   },
  //   jobParams: {
  //     jobType: IJobType.GET_POOLS_FROM_FACTORY,
  //     rpcUrl: 'https://arb1.arbitrum.io/rpc',
  //     pairsToQuote: [],
  //     extraSettings: JSON.stringify({
  //       configDB: {
  //         type: 'postgres',
  //         host: 'localhost',
  //         port: 5432,
  //         username: 'user_secret',
  //         password: 'pass_secret',
  //         database: 'config_info_db_test',
  //       },
  //       configData: {
  //         factoryAddress: '0x1a3C9B1d2F0529D97f2AfC5136Cc23E58f1FD35B',
  //         version: 'v3',
  //         dexId: 3,
  //         fee: 0,
  //         start: 441000000,
  //         finish: 441649629,
  //         dexName: 'Camelot',
  //         chainId: 42161,
  //       },
  //     }),
  //   },
  // },
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

