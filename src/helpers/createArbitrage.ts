import {IArbitrage} from '../store/state.types';

export function createArbitrage(
  params: Omit<IArbitrage, 'createdAt'>
): IArbitrage {
  return {
    createdAt: new Date().toISOString(),
    ...params,
  };
}
