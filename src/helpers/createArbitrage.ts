import {IArbitrage} from '../store/state.types';

export function createArbitrage(
): IArbitrage {
  return {
    createdAt: new Date().toISOString(),
  } as IArbitrage;
}
