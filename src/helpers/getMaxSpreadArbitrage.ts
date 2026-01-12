import {IGroupedQuotes} from '../store/state.types';

export function getMaxSpread(items: IGroupedQuotes[]): IGroupedQuotes | undefined {
  if (!items.length) return undefined;

  return items.reduce((max, item) =>
    (item.spread_pct ?? -Infinity) > (max.spread_pct ?? -Infinity) ? item : max
  );
}
