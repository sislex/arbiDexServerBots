// src/store/reducer.ts
import { Action } from './actions';
import {AppState, IActionType} from './state.types';

const ERROR_CAP = 1000;

export const initialState: AppState = {
  stateVersion: 1,
  appVersion: '0.0.2',
  serverStartedAt: new Date().toISOString(), // ✅ Время старта
  botsTypesList: [
    { type: 'TestBot', description: 'Test bot' },
  ],
  botsRulesList: [
    {
      id: 'botRule1',
      botParams: {
        botType: 'TestBot',
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
