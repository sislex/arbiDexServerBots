import {IPairToQuote} from '../store/state.types';

export function assertPool(x: IPairToQuote | null | undefined, name: string): asserts x is IPairToQuote {
  if (!x) throw new Error(`${name} is null/undefined`);
  if (!x.poolAddress) throw new Error(`${name}.poolAddress is empty`);
}
