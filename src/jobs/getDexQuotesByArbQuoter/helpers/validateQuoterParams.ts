import { IPool } from '../../../store/state.types';

export type ValidateParamsOk = {
  ok: true;
  quoterAddress: string;
};

export type ValidateParamsError = {
  ok: false;
  error: string;
};

export type ValidateParamsResult = ValidateParamsOk | ValidateParamsError;

/**
 * Валидация входных параметров перед запросом котировок.
 */
export function validateQuoterParams(
  pairsToQuote: IPool[] | undefined,
  quoterAddress: string | undefined,
): ValidateParamsResult {
  if (!quoterAddress) {
    return { ok: false, error: 'QUOTER_ADDRESS не задан в .env' };
  }

  if (!pairsToQuote || pairsToQuote.length === 0) {
    return { ok: false, error: 'pairsToQuote пуст' };
  }

  return { ok: true, quoterAddress };
}
