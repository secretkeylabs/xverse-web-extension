import { StacksProvider } from '@stacks/connect';
import {
  AuthenticationRequestEventDetails,
  DomEventName,
  SignatureRequestEventDetails,
  TransactionRequestEventDetails,
} from '../content-scripts/inpage-types';
import {
  AuthenticationResponseMessage,
  ExternalMethods,
  LegacyMessageToContentScript,
  MESSAGE_SOURCE,
  SignatureResponseMessage,
  TransactionResponseMessage,
} from '../content-scripts/message-types';

type CallableMethods = keyof typeof ExternalMethods;

interface ExtensionResponse {
  source: 'xverse-extension';
  method: CallableMethods;

  [key: string]: any;
}

const callAndReceive = async (
  methodName: CallableMethods | 'getURL',
  opts: any = {},
): Promise<ExtensionResponse> => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => {
    reject(new Error('Unable to get response from xverse extension'));
  }, 1000);
  const waitForResponse = (event: MessageEvent) => {
    if (
      event.data.source === 'xverse-extension'
        && event.data.method === `${methodName}Response`
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

const isValidEvent = (event: MessageEvent, method: LegacyMessageToContentScript['method']) => {
  const { data } = event;
  const correctSource = data.source === MESSAGE_SOURCE;
  const correctMethod = data.method === method;
  return correctSource && correctMethod && !!data.payload;
};

const provider: StacksProvider = {
  getURL: async () => {
    const { url } = await callAndReceive('getURL');
    return url;
  },
  structuredDataSignatureRequest: async (signatureRequest) => {
    const event = new CustomEvent<SignatureRequestEventDetails>(
      DomEventName.structuredDataSignatureRequest,
      {
        detail: { signatureRequest },
      },
    );
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<SignatureResponseMessage>) => {
        if (!isValidEvent(eventMessage, ExternalMethods.signatureResponse)) return;
        if (eventMessage.data.payload?.signatureRequest !== signatureRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.signatureResponse === 'cancel') {
          reject(eventMessage.data.payload.signatureResponse);
          return;
        }
        if (typeof eventMessage.data.payload.signatureResponse !== 'string') {
          resolve(eventMessage.data.payload.signatureResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  signatureRequest: async (signatureRequest) => {
    const event = new CustomEvent<SignatureRequestEventDetails>(DomEventName.signatureRequest, {
      detail: { signatureRequest },
    });
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<SignatureResponseMessage>) => {
        if (!isValidEvent(eventMessage, ExternalMethods.signatureResponse)) return;
        if (eventMessage.data.payload?.signatureRequest !== signatureRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.signatureResponse === 'cancel') {
          reject(eventMessage.data.payload.signatureResponse);
          return;
        }
        if (typeof eventMessage.data.payload.signatureResponse !== 'string') {
          resolve(eventMessage.data.payload.signatureResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  authenticationRequest: async (authenticationRequest) => {
    const event = new CustomEvent<AuthenticationRequestEventDetails>(
      DomEventName.authenticationRequest,
      {
        detail: { authenticationRequest },
      },
    );
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<AuthenticationResponseMessage>) => {
        if (!isValidEvent(eventMessage, ExternalMethods.authenticationResponse)) return;
        if (eventMessage.data.payload?.authenticationRequest !== authenticationRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.authenticationResponse === 'cancel') {
          reject(eventMessage.data.payload.authenticationResponse);
          return;
        }
        resolve(eventMessage.data.payload.authenticationResponse);
      };
      window.addEventListener('message', handleMessage);
    });
  },
  transactionRequest: async (transactionRequest) => {
    const event = new CustomEvent<TransactionRequestEventDetails>(DomEventName.transactionRequest, {
      detail: { transactionRequest },
    });
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<TransactionResponseMessage>) => {
        if (!isValidEvent(eventMessage, ExternalMethods.transactionResponse)) return;
        if (eventMessage.data.payload?.transactionRequest !== transactionRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.transactionResponse === 'cancel') {
          reject(eventMessage.data.payload.transactionResponse);
          return;
        }
        if (typeof eventMessage.data.payload.transactionResponse !== 'string') {
          resolve(eventMessage.data.payload.transactionResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  getProductInfo() {
    return {
      version: '0.0.1',
      name: 'Hiro Wallet for Web',
    };
  },
  request(): Promise<Record<string, any>> {
    throw new Error('`request` function is not implemented');
  },
};

window.StacksProvider = provider;
