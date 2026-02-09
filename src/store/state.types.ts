// src/store/state.types.ts
import {TestBot} from '../bots/test/testBot';
import {ApiEndpointDto} from './dto/api-endpoint.dto';
import {
  IPairQuoteResult,
  QuoteExactInputSingleRaw,
  QuoteExactOutputSingleRaw
} from '../jobs/getQuote_Arbitrum_Multi/arbitrum-multi.quote';

export type ContractAbi = readonly string[];

export type V2DexId = 'uniswap' | 'sushi' | 'pancake' | 'camelot';
export interface IV2DexConfig {
  name: string;
  router: Address;
  abi: ContractAbi;
}
export type V2DexesMap = Record<V2DexId, IV2DexConfig>;


export type V3QuoterId = 'uniswap' | 'sushi' | 'poolId' | 'camelot';
export interface IV3QuoterConfig {
  name: string;
  quoter: Address;
  abi: ContractAbi;
}
export type V3QuotersMap = Record<V3QuoterId, IV3QuoterConfig>;


export enum IBotType {
  TEST_BOT = 'TestBot',
  TEST_BOT_2 = 'TestBot2',
}

export enum IJobType {
  GET_POOL_STATE = 'get_Pool_State',
  GET_ARBITRUM_UNISWAP_V3_QUOTES = 'get_Arbitrum_UniswapV3_Quote',
  GET_ARBITRUM_QUOTES_MULTI = 'get_Arbitrum_Quote_Multi',
  GET_ARBITRUM_UNISWAP_V2_QUOTES = 'get_Arbitrum_UniswapV2_Quote',
  RESOLVE_POOLS_FOR_PAIRS = 'resolve_pools_for_pairs',
  GET_ARB_EXECUTOR_QUOTES = 'getArbExecutorQuotes',
}

export interface IJobDefaultParams { jobType: IJobType; }

export type DexId = 'uniswap' | 'sushi' | 'pancake' | 'camelot';
export type PoolVersion = 'v2' | 'v3';

export type QuoteSource =
  | 'uniswap-v2-router'
  | 'uniswap-v3-quoter-v2'
  | 'camelot-v3-quoter'
  | 'quoteBothBase';

export type Address = `0x${string}`;

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

export interface ITokenInfo {
  address: Address;
  decimals: number;
  symbol?: string;
  name?: string;
}

export interface IJobParams_get_Pool_State extends IJobDefaultParams {
  jobType: IJobType.GET_POOL_STATE;

  rpcUrl: string;
  poolAddress: Address;
  wordsAround: number;
  maxTicks: number;
}

interface IBasePairToQuote {
  dex: DexId;               // 'uniswap' | 'sushi'
  version: PoolVersion;     // 'v2' | 'v3'
  quoteSource: QuoteSource;

  tokenIn:  ITokenInfo;
  tokenOut: ITokenInfo;

  amountIn?:  bigint | string;
  amountOut?: bigint | string;

  feePpm?: number;
  poolAddress?: string;
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

export type IPairToQuote =
  | IQuote
  | IUniV2PairToQuote
  | IUniV3PairToQuote
  | ISushiV2PairToQuote
  | ISushiV3PairToQuote;

export interface IJobParams_get_Arbitrum_Quote_Multi extends IJobDefaultParams {
  jobType: IJobType.GET_ARBITRUM_QUOTES_MULTI;

  rpcUrl: string;

  pairsToQuote: IQuote[];

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

  poolAddress?: Address;

  roundUp?: boolean;
  ignoreFee?: boolean;
}

export interface IJobParams_get_Arbitrum_UniswapV2_Quote extends IJobDefaultParams {
  jobType: IJobType.GET_ARBITRUM_UNISWAP_V2_QUOTES;

  rpcUrl: string;

  pairsToQuote: IPairToQuote[];

  roundUp?: boolean;
  ignoreFee?: boolean;
}

export interface IJobParams_get_Arbitrum_Arb_Executor_Quotes extends IJobDefaultParams {
  jobType: IJobType.GET_ARB_EXECUTOR_QUOTES;
  rpcUrl: string;

  pairsToQuote: IQuote[];
  stepPrefundPct?: number;
  // stepPrefund?: {
  //   amount: bigint;
  //   tokenAddress: string;
  // };
}

export interface IJobParams_resolve_Pools_For_Pairs extends IJobDefaultParams {
  jobType: IJobType.RESOLVE_POOLS_FOR_PAIRS;

  rpcUrl: string;
  pairsToQuote: IPairToQuote[];
}

export interface IPool {
  dex: DexId;
  version: PoolVersion;
  poolAddress: string;
  token0: ITokenInfo;
  token1: ITokenInfo;
  feePpm: number;
}

export interface IPair extends IPool {
  tokenIn: ITokenInfo;
  tokenOut: ITokenInfo;
}

export type QuoteSide = "exactIn" | "exactOut";

/** QUOTE = pair + amount (+ blockTag) + результат */
export interface IQuote extends IPair {
  side: QuoteSide;            // "exactIn" | "exactOut"
  amount: string | bigint;             // amountIn (если exactIn) или amountOut (если exactOut), в smallest units
  amountOut?: string | bigint;
  amountOutMin?: bigint;

  blockTag?: number | "latest";

  quoteSource?: QuoteSource;       // например: "uniswap-v3-quoter-v2" | "uniswap-v2-router" | ...
  result?: IQuoteResult;      // результат котирования (если успешно)
  createdAt?: string;         // ISO string, если хочешь логировать снапшоты

  path?: ITokenInfo[];      // для v2-мультипула (если есть)
}

/** Данные для исполнения сделки (подготовка транзакции) */
export interface ITrade extends IQuote {
  slippageBps: number;        // 50 = 0.50%
  deadline: number;           // unix seconds

  recipient: string;          // кому отправить tokenOut
  routerAddress?: string;     // адрес роутера/пермиссионлесс контракта, если нужно

  // подготовленные данные для отправки транзакции (если у тебя есть отдельный слой исполнения)
  tx?: {
    to: string;
    data: string;
    value?: string;           // wei как строка
    gasLimit?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  };

  signature?: string;         // если ты подписываешь вне отправки (опционально)
  txHash?: string;            // после отправки
}

export interface BuildQuotesParams {
  pairs: IPair[];
  amount: string;                 // already in smallest units
  side?: QuoteSide;               // default: "exactIn"
  blockTag?: number | "latest";
  quoteSource?: QuoteSource;
  createdAt?: string;
}

export type IJobParams =
  | IJobParams_get_Arbitrum_Arb_Executor_Quotes
  | IJobParams_get_Pool_State
  | IJobParams_get_Arbitrum_UniswapV3_Quote
  | IJobParams_get_Arbitrum_Quote_Multi
  | IJobParams_get_Arbitrum_UniswapV2_Quote
  | IJobParams_resolve_Pools_For_Pairs;


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

export interface IBestArbitrageByGroup {
  bestBuy: IPairQuoteResult | null;
  bestSell: IPairQuoteResult | null;
}

export interface IGroupedQuotes {
  bestArbitrage: IBestArbitrageByGroup,
  amountOutStep1: bigint,
  spread_pct: number,
}

export interface IBestBuySellArbitrage {
  hasArbitrage: boolean;
  groups: IGroupedQuotes[];
}

export interface IArbitrage extends IBestBuySellArbitrage {
  createdAt: string;   // UTC ISO
  blockNumber: number;
}

export enum SwapKind {
  V2_EXACT_IN = 0,
  V3_POOL_EXACT_IN = 1,
}


export type ITwoStepsConfig = [IContractStep, IContractStep];

export interface IContractStep {
  kind: SwapKind;

  router: Address;     // V2: router, V3: ZeroAddress
  path: Address[];     // V2: [a,b,...], V3: []

  pool: Address;       // V3: poolAddress, V2: ZeroAddress

  tokenIn: Address;
  tokenOut: Address;

  amountIn: bigint;      // step0: amountIn, step1: 0n (auto from prev) если твой контракт так умеет
  amountOutMin: bigint;

  sqrtPriceLimitX96: number;
  deadline: number;
}

export interface IParsedArbitrage {
  createdAt: string;
  blockNumber: number;

  tokenIn?: ITokenInfo;
  tokenOut?: ITokenInfo;

  amountIn?: string | bigint;

  spread_pct?: number;
  spread_bps?: number;

  amountOut?: string;
  amountInBuy?: string;
  profitOutToken?: string;

  bestBuyPool?: IPairToQuote | null;
  bestSellPool?: IPairToQuote | null;
}

export  interface ISimulationStepsLogs {
  poolAddress: string;
  tokenIn: Address;
  tokenOut: Address;
  amountIn: bigint;
  amountOut: bigint;
  gas: bigint;
}

// один результат по одной паре
export interface IQuoteResult {
  pairToQuote: IQuote;
  simulationStepsLogs?: ISimulationStepsLogs[];
  error?: string;
  message?: string;
}

