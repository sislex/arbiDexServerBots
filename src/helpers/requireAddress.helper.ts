import {Address} from '../store/state.types';

export function requireAddress(
  v: string | undefined,
  name: string
): Address {
  if (!v) throw new Error(`${name} is undefined`);
  if (!v.startsWith("0x")) throw new Error(`${name} is not an address: ${v}`);
  return v as Address;
}
