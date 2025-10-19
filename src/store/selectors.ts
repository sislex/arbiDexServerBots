// src/store/selectors.ts
import { AppState, IBotType, IErrorItem } from './state.types';

export const selectVersion = (s: AppState) => s.version;

export const selectBotsTypes = (s: AppState): IBotType[] => s.botsTypesList;

export const selectBotTypeById = (type: string) =>
  (s: AppState): IBotType | undefined => s.botsTypesList.find(b => b.type === type);

export const selectErrors = (s: AppState): IErrorItem[] => s.errorList;

export const selectErrorsSince = (iso: string) =>
  (s: AppState): IErrorItem[] => s.errorList.filter(e => Date.parse(e.time) >= Date.parse(iso));
