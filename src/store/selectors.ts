// src/store/selectors.ts
import {AppState, IBot, IBotsRule, IBotTypeAndDescription} from './state.types';

export const selectVersion = (s: AppState) => s.version;

export const selectBotsTypes = (s: AppState): IBotTypeAndDescription[] => s.botsTypesList;
export const selectBotsRulesList = (s: AppState): IBotsRule[] => s.botsRulesList;
export const selectBotsList = (s: AppState): IBot[] => s.botsList;
