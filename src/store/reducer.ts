// src/store/reducer.ts
import { Action } from './actions';
import { AppState, IBotType } from './state.types';

const ERROR_CAP = 1000;

export const initialState: AppState = {
  version: 1,
  botsTypesList: [
    { type: 'arbiUniV3', description: 'arbitrum Uniswap V3' },
  ],
  errorList: [],
};

export function reducer(state: AppState = initialState, action: Action): AppState {
  switch (action.type) {
    // ---- botsTypesList ----
    case 'BOTS_TYPES/SET_ALL': {
      const list = dedupeByType(action.payload);
      return bump({ ...state, botsTypesList: list });
    }
    case 'BOTS_TYPES/ADD_ONE': {
      const list = dedupeByType([...state.botsTypesList, action.payload]);
      return bump({ ...state, botsTypesList: list });
    }
    case 'BOTS_TYPES/UPSERT_ONE': {
      const list = upsertByType(state.botsTypesList, action.payload);
      return bump({ ...state, botsTypesList: list });
    }
    case 'BOTS_TYPES/REMOVE_ONE': {
      const list = state.botsTypesList.filter(b => b.type !== action.payload.type);
      return bump({ ...state, botsTypesList: list });
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
  return { ...s, version: s.version + 1 };
}

function dedupeByType(list: IBotType[]): IBotType[] {
  const map = new Map<string, IBotType>();
  for (const i of list) map.set(i.type, i);
  return Array.from(map.values());
}

function upsertByType(list: IBotType[], item: IBotType): IBotType[] {
  const map = new Map<string, IBotType>(list.map(i => [i.type, i]));
  map.set(item.type, item);
  return Array.from(map.values());
}
