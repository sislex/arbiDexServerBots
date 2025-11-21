// src/store/selectors.ts
import {AppState, IJobTypeAndDescription, IBot, IBotsRule, IBotTypeAndDescription} from './state.types';
import {ApiEndpointDto} from './dto/api-endpoint.dto';

export const selectStateVersion = (s: AppState) => s.stateVersion;
export const selectAppVersion = (s: AppState) => s.appVersion;

export const selectServerStartedAt = (s: AppState) => s.serverStartedAt;

export const selectJobTypesList = (s: AppState): IJobTypeAndDescription[] => s.jobTypesList;
export const selectBotsTypes = (s: AppState): IBotTypeAndDescription[] => s.botsTypesList;
export const selectBotsRulesList = (s: AppState): IBotsRule[] => s.botsRulesList;
export const selectBotsList = (s: AppState): IBot[] => s.botsList;
export const selectBotsCount = (s: AppState): number => s.botsList.length;

export const selectApis = (s: AppState): ApiEndpointDto[] => s.apis;
