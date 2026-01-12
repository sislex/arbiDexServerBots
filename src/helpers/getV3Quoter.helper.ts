import {IV3QuoterConfig, V3QuoterId} from '../store/state.types';
import {V3_QUOTERS} from './dex.constants';

export function getV3Quoter(id: V3QuoterId): IV3QuoterConfig {
  return V3_QUOTERS[id];
}
