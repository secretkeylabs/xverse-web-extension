import { BitcoinProvider, GetAddressResponse, SignTransactionResponse } from 'sats-connect';
import {
  DomEventName,
  GetAddressRequestEventDetails,
  SignMessageRequestEventDetails,
  SignPsbtRequestEventDetails,
  SendBtcRequestEventDetails,
} from '@common/types/inpage-types';
import {
  ExternalSatsMethods,
  GetAddressResponseMessage,
  MESSAGE_SOURCE,
  SatsConnectMessageToContentScript,
  SignMessageResponseMessage,
  SignPsbtResponseMessage,
  SendBtcResponseMessage,
} from '@common/types/message-types';

const isValidEvent = (event: MessageEvent, method: SatsConnectMessageToContentScript['method']) => {
  const { data } = event;
  const correctSource = data.source === MESSAGE_SOURCE;
  const correctMethod = data.method === method;
  return correctSource && correctMethod && !!data.payload;
};

const SatsMethodsProvider: BitcoinProvider = {
  connect: async (btcAddressRequest): Promise<GetAddressResponse> => {
    const event = new CustomEvent<GetAddressRequestEventDetails>(DomEventName.getAddressRequest, {
      detail: { btcAddressRequest },
    });
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<GetAddressResponseMessage>) => {
        if (!isValidEvent(eventMessage, ExternalSatsMethods.getAddressResponse)) return;
        if (eventMessage.data.payload?.addressRequest !== btcAddressRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.addressResponse === 'cancel') {
          reject(eventMessage.data.payload.addressResponse);
          return;
        }
        if (typeof eventMessage.data.payload.addressResponse !== 'string') {
          resolve(eventMessage.data.payload.addressResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  signTransaction: async (signPsbtRequest: string): Promise<SignTransactionResponse> => {
    const event = new CustomEvent<SignPsbtRequestEventDetails>(DomEventName.signPsbtRequest, {
      detail: { signPsbtRequest },
    });
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<SignPsbtResponseMessage>) => {
        if (!isValidEvent(eventMessage, ExternalSatsMethods.signPsbtResponse)) return;
        if (eventMessage.data.payload?.signPsbtRequest !== signPsbtRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.signPsbtResponse === 'cancel') {
          reject(eventMessage.data.payload.signPsbtResponse);
          return;
        }
        if (typeof eventMessage.data.payload.signPsbtResponse !== 'string') {
          resolve(eventMessage.data.payload.signPsbtResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  signMessage: async (signMessageRequest: string): Promise<string> => {
    const event = new CustomEvent<SignMessageRequestEventDetails>(DomEventName.signMessageRequest, {
      detail: { signMessageRequest },
    });
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<SignMessageResponseMessage>) => {
        if (!isValidEvent(eventMessage, ExternalSatsMethods.signMessageResponse)) return;
        if (eventMessage.data.payload?.signMessageRequest !== signMessageRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.signMessageResponse === 'cancel') {
          reject(eventMessage.data.payload.signMessageResponse);
          return;
        }
        if (typeof eventMessage.data.payload.signMessageResponse === 'string') {
          resolve(eventMessage.data.payload.signMessageResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  sendBtcTransaction: async (sendBtcRequest: string): Promise<string> => {
    const event = new CustomEvent<SendBtcRequestEventDetails>(DomEventName.sendBtcRequest, {
      detail: { sendBtcRequest },
    });
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<SendBtcResponseMessage>) => {
        if (!isValidEvent(eventMessage, ExternalSatsMethods.sendBtcResponse)) return;
        if (eventMessage.data.payload?.sendBtcRequest !== sendBtcRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.sendBtcResponse === 'cancel') {
          reject(eventMessage.data.payload.sendBtcResponse);
          return;
        }
        if (typeof eventMessage.data.payload.sendBtcResponse === 'string') {
          resolve(eventMessage.data.payload.sendBtcResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  call(request: string): Promise<Record<string, any>> {
    throw new Error('`call` function is not implemented');
  },
};
export default SatsMethodsProvider;
