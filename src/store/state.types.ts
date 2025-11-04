// src/store/state.types.ts
import {TestBot} from '../bots/test/testBot';

export type IBotType = 'TestBot' | 'TestBot2';

export enum IActionType {
  GET_ARBITRUM_UNISWAP_V3_QUOTES = 'get_Arbitrum_UniswapV3_Quote',
  GET_ARBITRUM_UNISWAP_V2_QUOTES = 'get_Arbitrum_UniswapV2_Quote',
}

export interface IActionDefaultParams { actionType: IActionType; }

export interface IActionParams_get_Arbitrum_UniswapV3_Quote extends IActionDefaultParams {
  actionType: IActionType.GET_ARBITRUM_UNISWAP_V3_QUOTES;
  i: number;
}
export interface IActionParams_get_Arbitrum_UniswapV2_Quote extends IActionDefaultParams {
  actionType: IActionType.GET_ARBITRUM_UNISWAP_V2_QUOTES;
  k: number;
}

export type IActionParams =
  | IActionParams_get_Arbitrum_UniswapV3_Quote
  | IActionParams_get_Arbitrum_UniswapV2_Quote;



export interface IBotTypeAndDescription {
  type: IBotType;          // расширяемо
  description: string;                  // 'arbitrum Uniswap V3'
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

