import {Address} from '../store/state.types';

/** Утилита: строгий Address (0x...) */
export function asAddress(v: string): Address {
  if (!v?.startsWith("0x")) throw new Error(`Not an address: ${v}`);
  return v as Address;
}
