import { createUnsecuredToken, decodeToken } from 'jsontokens';
import { parse, stringify } from 'superjson';
import { ZodSchema } from 'zod';

export function getTabIdFromPort(port: chrome.runtime.Port) {
  return port.sender?.tab?.id ?? 0;
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

type ExtractedParam = ReturnType<URLSearchParams['get']>;
export function getParams<T extends Array<string>>(
  paramNames: T,
  params: URLSearchParams,
): Record<T[number], ExtractedParam> {
  const obj: Record<T[number], ExtractedParam> = {} as Record<T[number], ExtractedParam>;

  paramNames.forEach((name) => {
    obj[name] = params.get(name);
  });

  return obj;
}

export function stringifyData(data: unknown) {
  return createUnsecuredToken(stringify(data));
}

export function parseData<TData>(stringifiedData: string, schema: ZodSchema<TData>) {
  const parseResult = schema.safeParse(parse(decodeToken(stringifiedData).payload as any));
  if (!parseResult.success) return [parseResult.error, null] as const;

  return [null, parseResult.data] as const;
}
