import { getTabIdFromPort } from '@common/utils';
import { makeContext, openPopup } from '@common/utils/popup';
import RequestsRoutes from '@common/utils/route-urls';
import type { ChangeNetworkRequestMessage } from '@sats-connect/core';
import rootStore from '@stores/index';
import { makeSendPopupClosedUserRejectionMessage } from '../helpers';
import { sendInvalidParametersResponseMessage } from '../responseMessages/errors';

export async function handleChangeNetwork(
  message: ChangeNetworkRequestMessage,
  port: chrome.runtime.Port,
) {
  const { network, _persist: persist } = rootStore.store.getState().walletState;

  const desiredNetwork = message.params?.name;

  if (network.type === desiredNetwork && persist.rehydrated) {
    sendInvalidParametersResponseMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
      error: 'Network already active',
    });
    return;
  }

  await openPopup({
    path: RequestsRoutes.ChangeNetworkRequest,
    data: message,
    context: makeContext(port),
    onClose: makeSendPopupClosedUserRejectionMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
    }),
  });
}
