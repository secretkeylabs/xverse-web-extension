import { AddStakedBitcoinEventDetails, DomEventName } from '@common/types/inpage-types';
import { AddStakedBitcoinResponseMessage, StakesMethods } from '@common/types/message-types';

import { isValidLegacyEvent } from './utils';

export interface StakesProvider {
  addStakedBitcoin: (params: string) => Promise<string>;
  getStakedBitcoin: (address: string) => Promise<{ address: string; script: string }[]>;
}

const StakesMethodsProvider: StakesProvider = {
  addStakedBitcoin: async (addStakedBitcoinRequest): Promise<string> => {
    const event = new CustomEvent<AddStakedBitcoinEventDetails>(
      DomEventName.addStakedBitcoinRequest,
      {
        detail: { addStakedBitcoinRequest },
      },
    );
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<AddStakedBitcoinResponseMessage>) => {
        if (!isValidLegacyEvent(eventMessage, StakesMethods.addStakedBitcoinResponse)) return;
        if (eventMessage.data.payload?.addStakedBitcoinRequest !== addStakedBitcoinRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.addStakedBitcoinResponse === 'cancel') {
          reject(eventMessage.data.payload.addStakedBitcoinResponse);
          return;
        }
        if (typeof eventMessage.data.payload.addStakedBitcoinResponse !== 'string') {
          resolve(eventMessage.data.payload.addStakedBitcoinResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  getStakedBitcoin: async (
    getStakedBitcoinRequest,
  ): Promise<{ address: string; script: string }[]> => {
    const result = [];
    return result;
    // const event = new CustomEvent<GetStakedBitcoinEventDetails>(
    //   DomEventName.getStakedBitcoinRequest,
    //   {
    //     detail: {
    //       getStakedBitcoinRequest,
    //     },
    //   },
    // );
    // document.dispatchEvent(event);
    // return new Promise((resolve, reject) => {
    //   const handleMessage = (eventMessage: MessageEvent<GetStakedBitcoinResponseMessage>) => {
    //     if (!isValidLegacyEvent(eventMessage, StakesMethods.getStakedBitcoinResponse)) return;
    //     if (eventMessage.data.payload?.getStakedBitcoinRequest !== getStakedBitcoinRequest) return;
    //     window.removeEventListener('message', handleMessage);
    //     if (eventMessage.data.payload.getStakedBitcoinResponse === 'cancel') {
    //       reject(eventMessage.data.payload.getStakedBitcoinResponse);
    //       return;
    //     }
    //     if (typeof eventMessage.data.payload.getStakedBitcoinResponse !== 'string') {
    //       resolve(eventMessage.data.payload.getStakedBitcoinResponse);
    //     }
    //   };
    //   window.addEventListener('message', handleMessage);
    // });
  },
};
export default StakesMethodsProvider;
