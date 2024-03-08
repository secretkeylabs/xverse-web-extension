import {
  AuthenticationRequestEventDetails,
  DomEventName,
  SignatureRequestEventDetails,
  TransactionRequestEventDetails,
} from '@common/types/inpage-types';
import {
  AuthenticationResponseMessage,
  SignatureResponseMessage,
  StacksLegacyMethods,
  TransactionResponseMessage,
} from '@common/types/message-types';
import { StacksProvider } from '@stacks/connect';
import { callAndReceive, isValidLegacyEvent } from './utils';

declare const VERSION: string;

const StacksMethodsProvider: Partial<StacksProvider> = {
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
        if (!isValidLegacyEvent(eventMessage, StacksLegacyMethods.signatureResponse)) return;
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
        if (!isValidLegacyEvent(eventMessage, StacksLegacyMethods.signatureResponse)) return;
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
        if (!isValidLegacyEvent(eventMessage, StacksLegacyMethods.authenticationResponse)) return;
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
        if (!isValidLegacyEvent(eventMessage, StacksLegacyMethods.transactionResponse)) return;
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
      version: VERSION,
      name: 'Xverse Wallet',
    };
  },
  request(): Promise<Record<string, any>> {
    throw new Error('`request` function is not implemented');
  },
};

export default StacksMethodsProvider;
