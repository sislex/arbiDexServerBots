import {DexId} from '../store/state.types';
import {V3_QUOTERS} from './dex.constants';

export function ensureV3Known(dex: DexId) {
  const q = V3_QUOTERS[dex];
  if (!q?.quoter) throw new Error(`V3 quoter not found for dex="${dex}" in V3_QUOTERS`);
}
