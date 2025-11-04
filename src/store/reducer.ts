// src/store/reducer.ts
import { Action } from './actions';
import {AppState, IActionType, IBotType} from './state.types';

const ERROR_CAP = 1000;

export const initialState: AppState = {
  stateVersion: 1,
  appVersion: '0.0.2',
  serverStartedAt: new Date().toISOString(), // ✅ Время старта
  botsTypesList: [
    { type: IBotType.TEST_BOT, description: 'Test bot' },
    { type: IBotType.TEST_BOT_2, description: 'TestBot2' },
  ],
  actionsTypesList: [
    { type: IActionType.GET_ARBITRUM_UNISWAP_V3_QUOTES, description: 'get_Arbitrum_UniswapV3_Quote' },
    { type: IActionType.GET_ARBITRUM_UNISWAP_V2_QUOTES, description: 'get_Arbitrum_UniswapV2_Quote' },
  ],
  botsRulesList: [
    {
      id: 'botRule1',
      botParams: {
        botType: IBotType.TEST_BOT,
        paused: false,
        isRepeat: true,
        delayBetweenRepeat: 1000,
        maxActions: 2,
      },
      actionParams: {
        actionType: IActionType.GET_ARBITRUM_UNISWAP_V3_QUOTES,
        i: 1
      }
    },
  ],
  botsList: [],
  errorList: [],
};

export function reducer(state: AppState = initialState, action: Action): AppState {
  switch (action.type) {
    // ---- botsTypesList ----

    // ---- botList ----
    case 'BOTS_LIST/SET_ALL': {
      return bump({ ...state, botsList: action.payload.botsList });
    }

    // ---- errorList ----
    case 'ERRORS/PUSH': {
      const list = [...state.errorList, action.payload];
      if (list.length > ERROR_CAP) list.splice(0, list.length - ERROR_CAP);
      return bump({ ...state, errorList: list });
    }
    case 'ERRORS/CLEAR': {
      return bump({ ...state, errorList: [] });
    }

    default:
      return state;
  }
}

function bump(s: AppState): AppState {
  return { ...s, stateVersion: s.stateVersion + 1 };
}
