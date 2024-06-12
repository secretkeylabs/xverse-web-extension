import { AddLockedBitcoinEventDetails, DomEventName } from '@common/types/inpage-types';
import { AddLockedBitcoinResponseMessage, LockedBitcoinMethods } from '@common/types/message-types';

import { isValidLegacyEvent } from './utils';

export interface LockedBitcoinProvider {
  addLockedBitcoin: (params: string) => Promise<string>;
}

const LockedBitcoinMethodsProvider: LockedBitcoinProvider = {
  addLockedBitcoin: async (addLockedBitcoinRequest): Promise<string> => {
    const event = new CustomEvent<AddLockedBitcoinEventDetails>(
      DomEventName.addLockedBitcoinRequest,
      {
        detail: { addLockedBitcoinRequest },
      },
    );
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<AddLockedBitcoinResponseMessage>) => {
        if (!isValidLegacyEvent(eventMessage, LockedBitcoinMethods.addLockedBitcoinResponse))
          return;
        if (eventMessage.data.payload?.addLockedBitcoinRequest !== addLockedBitcoinRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.addLockedBitcoinResponse === 'cancel') {
          reject(eventMessage.data.payload.addLockedBitcoinResponse);
          return;
        }
        resolve(eventMessage.data.payload.addLockedBitcoinResponse);
      };
      window.addEventListener('message', handleMessage);
    });
  },
};
export default LockedBitcoinMethodsProvider;
