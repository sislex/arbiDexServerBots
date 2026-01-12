import {Address, DexId, V2DexesMap} from '../store/state.types';

export function v2RouterOf(dex: DexId, v2Dexes: V2DexesMap): Address {
  const cfg = (v2Dexes as any)[dex];
  if (!cfg?.router) throw new Error(`No V2 router for dex=${dex}`);
  return cfg.router as Address;
}
