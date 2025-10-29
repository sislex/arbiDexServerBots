// src/store/state.types.ts
import {TestBot} from '../bots/test/testBot';

export type IBotType = 'TestBot' | 'TestBot2';
export enum IActionType {
  ARBITRUM_UNISWAP_V3_QUOTES = 'ARBITRUM_UNISWAP_V3_QUOTES',
  ARBITRUM_UNISWAP_V2_QUOTES = 'ARBITRUM_UNISWAP_V2_QUOTES',
}

export interface IActionDefaultParams { actionType: IActionType; }

export interface IActionParams_ArbitrumUniswapV3Quotes extends IActionDefaultParams {
  actionType: IActionType.ARBITRUM_UNISWAP_V3_QUOTES;
  i: number;
}
export interface IActionParams_ArbitrumUniswapV2Quotes extends IActionDefaultParams {
  actionType: IActionType.ARBITRUM_UNISWAP_V2_QUOTES;
  k: number;
}

export type IActionParams =
  | IActionParams_ArbitrumUniswapV3Quotes
  | IActionParams_ArbitrumUniswapV2Quotes;



export interface IBotTypeAndDescription {
  type: IBotType;          // расширяемо
  description: string;                  // 'arbitrum Uniswap V3'
}

export interface IErrorItem {
  time: string;                         // ISO
  errorMessage: string;
}

export interface AppState {
  version: number;                      // увеличиваем при каждом экшене
  botsTypesList: IBotTypeAndDescription[];            // feature #1
  botsRulesList: IBotsRule[];            // feature #1
  botsList: IBot[];            // feature #1
  errorList: IErrorItem[];              // feature #2 (cap по размеру)
}

export interface IBotParams {
  botType: IBotType,
  paused: boolean,
  isRepeat: boolean,
  delayBetweenRepeat?: number,
  maxActions: number,
}

export interface IBotsRule {
  id: string;                           // уникальный ид настроек бота
  botParams: IBotParams;
  actionParams: IActionParams;
}

export interface IBot {
  id: string;                           // уникальный ид бота, соответствует id из botsSettingsList
  botInstance: TestBot;
}
