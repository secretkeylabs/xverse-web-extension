import { createUnsecuredToken, decodeToken } from 'jsontokens';
import { parse, stringify } from 'superjson';
import { ZodSchema } from 'zod';

export function getTabIdFromPort(port: chrome.runtime.Port) {
  const tabId = port.sender?.tab?.id;

  if (!tabId) {
    throw new Error('Could not determine tab id from port.', { cause: port });
  }

  return tabId;
}

export function getOriginFromPort(port: chrome.runtime.Port) {
  const origin = port.sender?.url ? new URL(port.sender.url).origin : port.sender?.origin;

  if (!origin) {
    throw new Error('Could not determine origin from port.', { cause: port });
  }

  return origin;
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

export function stringifyData(data: unknown) {
  return createUnsecuredToken(stringify(data));
}

export function parseData<TData>(stringifiedData: string, schema: ZodSchema<TData>) {
  const parseResult = schema.safeParse(parse(decodeToken(stringifiedData).payload as any));
  if (!parseResult.success) return [parseResult.error, null] as const;

  return [null, parseResult.data] as const;
}
