import {
  LegacyMessageToContentScript,
  MESSAGE_SOURCE,
  SatsConnectMessageToContentScript,
  StacksLegacyMethods,
  StakedMessageToContentScript,
} from '@common/types/message-types';

type CallableMethods = keyof typeof StacksLegacyMethods;

interface ExtensionResponse {
  source: 'xverse-extension';
  method: CallableMethods;

  [key: string]: any;
}

export const isValidLegacyEvent = (
  event: MessageEvent,
  method:
    | SatsConnectMessageToContentScript['method']
    | LegacyMessageToContentScript['method']
    | StakedMessageToContentScript['method'],
) => {
  const { data } = event;
  const correctSource = data.source === MESSAGE_SOURCE;
  const correctMethod = data.method === method;
  return correctSource && correctMethod && !!data.payload;
};

export const isValidRpcEvent = (event: MessageEvent) => {
  const { data } = event;
  return data.source === MESSAGE_SOURCE;
};

export const callAndReceive = async (
  methodName: CallableMethods | 'getURL',
  opts: any = {},
): Promise<ExtensionResponse> =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Unable to get response from xverse extension'));
    }, 1000);
    const waitForResponse = (event: MessageEvent) => {
      if (
        event.data.source === 'xverse-extension' &&
        event.data.method === `${methodName}Response`
      ) {
        clearTimeout(timeout);
        window.removeEventListener('message', waitForResponse);
        resolve(event.data);
      }
    };
    window.addEventListener('message', waitForResponse);
    window.postMessage(
      {
        method: methodName,
        source: 'xverse-app',
        ...opts,
      },
      window.location.origin,
    );
  });
