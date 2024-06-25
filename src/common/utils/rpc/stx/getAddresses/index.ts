import { WebBtcMessage } from '@common/types/message-types';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext } from '@common/utils/popup';
import { RpcErrorCode } from '@sats-connect/core';
import rootStore from '@stores/index';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../../../legacy-external-message-handler';
import RequestsRoutes from '../../../route-urls';
import { makeRPCError } from '../../helpers';
import { sendGetAddressesSuccessResponseMessage } from '../../responseMessages/stacks';
import { hasPermissions } from './utils';

const handleGetStxAddresses = async (
  message: WebBtcMessage<'stx_getAddresses'>,
  port: chrome.runtime.Port,
) => {
  const popupParams = {
    messageId: String(message.id),
    rpcMethod: 'stx_getAddresses',
  };

  const { origin, tabId } = makeContext(port);
  if (await hasPermissions(origin)) {
    const {
      selectedAccountIndex,
      selectedAccountType,
      accountsList: softwareAccountsList,
      ledgerAccountsList,
    } = rootStore.store.getState().walletState;

    const account = getSelectedAccount({
      selectedAccountIndex,
      selectedAccountType,
      softwareAccountsList,
      ledgerAccountsList,
    });

    if (account) {
      sendGetAddressesSuccessResponseMessage({
        tabId,
        messageId: message.id,
        result: {
          addresses: [
            {
              address: account.stxAddress,
              publicKey: account.btcPublicKey,
            },
          ],
        },
      });
      return;
    }
  }

  const { urlParams } = makeSearchParamsWithDefaults(port, popupParams);

  const { id } = await triggerRequestWindowOpen(RequestsRoutes.StxAddressRequest, urlParams);
  listenForPopupClose({
    tabId,
    id,
    response: makeRPCError(message.id, {
      code: RpcErrorCode.USER_REJECTION,
      message: 'User rejected request to get addresses',
    }),
  });
};

export default handleGetStxAddresses;
