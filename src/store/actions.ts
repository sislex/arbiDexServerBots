// src/store/actions.ts
import {IBot, IBotType, IErrorItem} from './state.types';

export type Action =
// botsTypesList
  | { type: 'BOTS_TYPES/SET_ALL'; payload: IBotType[] }
  | { type: 'BOTS_TYPES/ADD_ONE'; payload: IBotType }
  | { type: 'BOTS_TYPES/UPSERT_ONE'; payload: IBotType }      // по type
  | { type: 'BOTS_TYPES/REMOVE_ONE'; payload: { type: string } }

  | { type: 'BOTS_LIST/SET_ALL'; payload: { botsList: IBot[] } }

  // errorList
  | { type: 'ERRORS/PUSH'; payload: IErrorItem }
  | { type: 'ERRORS/CLEAR' };
