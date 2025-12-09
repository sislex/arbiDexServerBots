// src/store/state.types.ts
import {TestBot} from '../bots/test/testBot';
import {ApiEndpointDto} from './dto/api-endpoint.dto';

export enum IBotType {
  TEST_BOT = 'TestBot',
  TEST_BOT_2 = 'TestBot2',
}

export enum IJobType {
  GET_POOL_STATE = 'get_Pool_State',
  GET_ARBITRUM_UNISWAP_V3_QUOTES = 'get_Arbitrum_UniswapV3_Quote',
  GET_ARBITRUM_UNISWAP_V3_QUOTES_MULTI = 'get_Arbitrum_UniswapV3_Quote_Multi',
  GET_ARBITRUM_UNISWAP_V2_QUOTES = 'get_Arbitrum_UniswapV2_Quote',
}

export interface IJobDefaultParams { jobType: IJobType; }

export type DexId = 'uniswap' | 'sushi';
export type PoolVersion = 'v2' | 'v3';

export interface ITokenInfo {
  address: `0x${string}`;
  decimals: number;
  symbol?: string;
  name?: string;
}

export interface IJobParams_get_Pool_State extends IJobDefaultParams {
  jobType: IJobType.GET_POOL_STATE;

  rpcUrl: string;
  poolAddress: `0x${string}`;
  wordsAround: number;
  maxTicks: number;
}

interface IBasePairToQuote {
  dex: DexId;               // 'uniswap' | 'sushi'
  version: PoolVersion;     // 'v2' | 'v3'

  tokenIn:  ITokenInfo;
  tokenOut: ITokenInfo;

  amountIn?:  bigint | string;
  amountOut?: bigint | string;

  feePpm?: number;
}

export interface IUniV3PairToQuote extends IBasePairToQuote {
  dex: 'uniswap';
  version: 'v3';
  feePpm: number;       // ОБЯЗАТЕЛЬНО для v3
}

export interface ISushiV3PairToQuote extends IBasePairToQuote {
  dex: 'sushi';
  version: 'v3';
  feePpm: number;
}

export interface IUniV2PairToQuote extends IBasePairToQuote {
  dex: 'uniswap';
  version: 'v2';
  path?: ITokenInfo[];  // [tokenIn, ..., tokenOut]
}

export interface ISushiV2PairToQuote extends IBasePairToQuote {
  dex: 'sushi';
  version: 'v2';
  path?: ITokenInfo[];
}

export type IPairToQuote =
  | IUniV2PairToQuote
  | IUniV3PairToQuote
  | ISushiV2PairToQuote
  | ISushiV3PairToQuote;

export interface IJobParams_get_Arbitrum_UniswapV3_Quote_Multi extends IJobDefaultParams {
  jobType: IJobType.GET_ARBITRUM_UNISWAP_V3_QUOTES_MULTI;

  rpcUrl: string;

  pairsToQuote: IPairToQuote[];

  roundUp?: boolean;
  ignoreFee?: boolean;
}

export interface IJobParams_get_Arbitrum_UniswapV3_Quote extends IJobDefaultParams {
  jobType: IJobType.GET_ARBITRUM_UNISWAP_V3_QUOTES;

  rpcUrl: string;

  tokenIn:  ITokenInfo;
  tokenOut: ITokenInfo;

  amountIn?: bigint | string;                // 1000 USDC → "1000000000"
  amountOut?: bigint | string;                // 1000 USDC → "1000000000"
  feePpm: number;                           // 500, 3000...

  poolAddress?: `0x${string}`;

  roundUp?: boolean;
  ignoreFee?: boolean;
}

export interface IJobParams_get_Arbitrum_UniswapV2_Quote extends IJobDefaultParams {
  jobType: IJobType.GET_ARBITRUM_UNISWAP_V2_QUOTES;
  k: number;
}

export type IJobParams =
  | IJobParams_get_Pool_State
  | IJobParams_get_Arbitrum_UniswapV3_Quote
  | IJobParams_get_Arbitrum_UniswapV3_Quote_Multi
  | IJobParams_get_Arbitrum_UniswapV2_Quote;


export interface IJobTypeAndDescription {
  type: IJobType;
  description: string;
}



export interface IBotTypeAndDescription {
  type: IBotType;
  description: string;
}

export interface IErrorItem {
  time: string;                         // ISO
  errorMessage: string;
}

export interface AppState {
  stateVersion: number;                      // увеличиваем при каждом экшене
  appVersion: string;                    // версия из package.json
  serverStartedAt: string;
  botsTypesList: IBotTypeAndDescription[];            // feature #1
  jobTypesList: IJobTypeAndDescription[];            // feature #1
  botsRulesList: IBotsRule[];            // feature #1
  botsList: IBot[];            // feature #1
  errorList: IErrorItem[];              // feature #2 (cap по размеру)
  apis: ApiEndpointDto[];              // feature #2 (cap по размеру)
}

export interface IBotParams {
  botType: IBotType,
  paused: boolean,
  isRepeat: boolean,
  delayBetweenRepeat?: number,
  maxJobs: number,
  maxErrors?: number,
  maxArbitrage?: number,
  timeoutMs?: number,
}

export interface IBotsRule {
  id: string;                           // уникальный ид настроек бота
  botParams: IBotParams;
  jobParams: IJobParams;
}

export interface IBot {
  id: string;                           // уникальный ид бота, соответствует id из botsSettingsList
  botInstance: TestBot;
}

