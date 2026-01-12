import { V2_DEXES } from "./dex.constants";
import {Address, V2DexId} from '../store/state.types';

export function getV2Router(dex: V2DexId): Address {
  const cfg = V2_DEXES[dex];
  if (!cfg) {
    throw new Error(`V2 dex "${dex}" not found in V2_DEXES`);
  }
  return cfg.router;
}
