import { MICROSTX_IN_STX } from './transactionDetails/utils';

export function mapObjectValues<K extends keyof any, V, V2>(
  obj: Record<K, V>,
  fn: (arg: V) => V2,
): Record<K, V2> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v as V)])) as Record<K, V2>;
}

export function microStxToStx(microStx: number | string | bigint) {
  const microStxNumber = Number(microStx);
  return Number(microStxNumber) / MICROSTX_IN_STX;
}
