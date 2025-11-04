// src/store/selectors.ts
import {AppState, IActionTypeAndDescription, IBot, IBotsRule, IBotTypeAndDescription} from './state.types';

export const selectStateVersion = (s: AppState) => s.stateVersion;
export const selectAppVersion = (s: AppState) => s.appVersion;

export const selectServerStartedAt = (s: AppState) => s.serverStartedAt;

export const selectActionsTypesList = (s: AppState): IActionTypeAndDescription[] => s.actionsTypesList;
export const selectBotsTypes = (s: AppState): IBotTypeAndDescription[] => s.botsTypesList;
export const selectBotsRulesList = (s: AppState): IBotsRule[] => s.botsRulesList;
export const selectBotsList = (s: AppState): IBot[] => s.botsList;
export const selectBotsCount = (s: AppState): number => s.botsList.length;
