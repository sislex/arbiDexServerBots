import {IV2DexConfig, V2DexId} from '../store/state.types';
import {V2_DEXES} from './dex.constants';

export function getV2Dex(id: V2DexId): IV2DexConfig {
  return V2_DEXES[id];
}
