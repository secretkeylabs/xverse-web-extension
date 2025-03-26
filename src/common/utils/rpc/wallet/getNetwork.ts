import { getTabIdFromPort } from '@common/utils';
import type { GetNetworkRequestMessage, GetNetworkResult } from '@sats-connect/core';
import rootStore from '@stores/index';
import { getBitcoinNetworkType } from '../helpers';
import { sendGetNetworkSuccessResponseMessage } from '../responseMessages/wallet';

export function handleGetNetwork(message: GetNetworkRequestMessage, port: chrome.runtime.Port) {
  const { network } = rootStore.store.getState().walletState;

  const result: GetNetworkResult = {
    bitcoin: {
      name: getBitcoinNetworkType(network.type),
    },
    stacks: {
      // QUESTION: Do we need to add a stacks network names we could use here?
      name: network.type,
    },
  };

  sendGetNetworkSuccessResponseMessage({
    tabId: getTabIdFromPort(port),
    messageId: message.id,
    result,
  });
}
