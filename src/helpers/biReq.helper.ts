import {toBigIntSafe} from './toBigIntSafe';

/**
 * STRICT bigint getter:
 * - конвертация ТОЛЬКО через toBigIntSafe
 * - кидает ошибку, если значения нет или оно 0 (опционально)
 */
export function biReq(
  v: bigint | string | undefined,
  name: string,
  opts?: { allowZero?: boolean }
): bigint {
  const r = toBigIntSafe(v);
  if (r === undefined) throw new Error(`${name} is undefined`);
  if (!opts?.allowZero && r === 0n) throw new Error(`${name} is zero`);
  return r;
}
