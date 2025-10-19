// src/store/state.types.ts
export interface IBotType {
  type: 'arbiUniV3' | string;          // расширяемо
  description: string;                  // 'arbitrum Uniswap V3'
}

export interface IErrorItem {
  time: string;                         // ISO
  errorMessage: string;
}

export interface AppState {
  version: number;                      // увеличиваем при каждом экшене
  botsTypesList: IBotType[];            // feature #1
  errorList: IErrorItem[];              // feature #2 (cap по размеру)
}
