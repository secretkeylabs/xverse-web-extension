import { BitcoinProvider } from 'sats-connect';
import {
  AuthenticationRequestEventDetails,
  DomEventName,
  GetAddressRequestEventDetails,
} from '@common/types/inpage-types';
import {
  AuthenticationResponseMessage,
  ExternalSatsMethods,
  GetAddressResponseMessage,
  MESSAGE_SOURCE,
  SatsConnectMessageToContentScript,
} from '@common/types/message-types';

const isValidEvent = (event: MessageEvent, method: SatsConnectMessageToContentScript['method']) => {
  const { data } = event;
  const correctSource = data.source === MESSAGE_SOURCE;
  const correctMethod = data.method === method;
  return correctSource && correctMethod && !!data.payload;
};

const SatsMethodsProvider: BitcoinProvider = {
  getAddress: async (purpose, message, network) => {
    const event = new CustomEvent<GetAddressRequestEventDetails>(DomEventName.getAddressRequest, {
      detail: {
        message,
        network: network || {
          address: '',
          type: 'Mainnet',
        },
        purpose,
      },
    });
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<GetAddressResponseMessage>) => {
        if (!isValidEvent(eventMessage, ExternalSatsMethods.getAddressResponse)) return;
        if (eventMessage.data.payload?.addressRequest.purpose.purpose !== purpose.purpose) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.addressResponse.address === 'cancel') {
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
        if (!isValidEvent(eventMessage, ExternalSatsMethods.authenticationResponse)) return;
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
};
export default SatsMethodsProvider;
