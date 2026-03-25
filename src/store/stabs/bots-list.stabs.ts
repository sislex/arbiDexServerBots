import {IBotsRule, IBotType, IJobType, IPool} from '../state.types';

export const BotList10: IBotsRule[] = [
  {
    "id": "1",
    "botParams": {
      "botType": IBotType.TEST_BOT,
      "paused": false,
      "isRepeat": true,
      delayBetweenRepeat: 200,
      maxJobs: 1,
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
  }
];

export const BotListFiltered: IBotsRule[] =  BotList10.map((bot:IBotsRule) => {
  const botFiltered = {
    ...bot,
    jobParams: {
      ...bot.jobParams,
    }
  }

  if (botFiltered.jobParams.jobType === IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER) {

    // Step 1: убираем проблемные пулы (revert, огромный газ и т.д.)
    const  _blacklistFiltered = botFiltered.jobParams.pairsToQuote.filter((pair: IPool) => {
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

    // Step 2: убираем пары token0/token1 которые встречаются только 1 раз (для арбитража нужно минимум 2 пула в паре)
    const _pairCount = new Map<string, number>();
    for (const p of _blacklistFiltered) {
      const key = p.token0.toLowerCase() + '-' + p.token1.toLowerCase();
      _pairCount.set(key, (_pairCount.get(key) || 0) + 1);
    }

    botFiltered.jobParams.pairsToQuote = _blacklistFiltered.filter((p) => {
      const key = p.token0.toLowerCase() + '-' + p.token1.toLowerCase();
      return (_pairCount.get(key) || 0) >= 2;
    });


  }

  return botFiltered;
});

export const BotListFilteredUSDC: IBotsRule[] =  BotList10.map((bot:IBotsRule) => {
  const botFiltered = {
    ...bot,
    jobParams: {
      ...bot.jobParams,
    }
  }

  if (botFiltered.jobParams.jobType === IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER) {

    botFiltered.jobParams.pairsToQuote = botFiltered.jobParams.pairsToQuote.filter((pair: IPool) => {
      return pair.token0.toLowerCase() === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase()
        && pair.token1.toLowerCase() === '0xaf88d065e77c8cc2239327c5edb3a432268e5831'.toLowerCase();
    });

  }

  return botFiltered;
});

