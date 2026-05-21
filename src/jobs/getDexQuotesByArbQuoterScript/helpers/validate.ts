import { IPool } from '../../../store/state.types';

export type ValidateParamsOk = {
  ok: true;
  quoterAddress: string;
  envPrefix: 'ARBITRUM' | 'OPTIMISM' | 'BASE' | 'LINEA' | 'BLAST';
};

export type ValidateParamsError = {
  ok: false;
  error: string;
};

export type ValidateParamsResult = ValidateParamsOk | ValidateParamsError;

export function validateScriptQuoterParams(
  pairsToQuote: IPool[] | undefined,
  quoterAddress: string | undefined,
  envPrefix: 'ARBITRUM' | 'OPTIMISM' | 'BASE' | 'LINEA' | 'BLAST' | null,
): ValidateParamsResult {
  if (!envPrefix) {
    return { ok: false, error: 'source должен быть одним из: dex:arbitrum|dex:optimism|dex:base|dex:linea|dex:blast' };
  }
  if (!quoterAddress) {
    return { ok: false, error: 'QUOTER_ADDRESS не задан для выбранной сети' };
  }
  if (!pairsToQuote || pairsToQuote.length === 0) {
    return { ok: false, error: 'pairsToQuote пуст' };
  }
  return { ok: true, quoterAddress, envPrefix };
}

