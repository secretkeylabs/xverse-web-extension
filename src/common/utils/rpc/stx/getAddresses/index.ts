import { type WebBtcMessage } from '@common/types/message-types';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext } from '@common/utils/popup';
import * as utils from '@components/permissionsManager/utils';
import { AddressPurpose, AddressType, RpcErrorCode } from '@sats-connect/core';
import rootStore from '@stores/index';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../../../legacy-external-message-handler';
import RequestsRoutes from '../../../route-urls';
import { hasAccountReadPermissions, makeRPCError } from '../../helpers';
import {
  sendAccessDeniedResponseMessage,
  sendInternalErrorMessage,
} from '../../responseMessages/errors';
import { sendGetAddressesSuccessResponseMessage } from '../../responseMessages/stacks';

const handleGetStxAddresses = async (
  message: WebBtcMessage<'stx_getAddresses'>,
  port: chrome.runtime.Port,
) => {
  const popupParams = {
    messageId: String(message.id),
    rpcMethod: 'stx_getAddresses',
  };
  const { origin, tabId } = makeContext(port);

  const [error, store] = await utils.getPermissionsStore();
  if (error) {
    sendInternalErrorMessage({
      tabId,
      messageId: message.id,
      message: 'Error loading permissions store.',
    });
    return;
  }

  if (!hasAccountReadPermissions(origin, store)) {
    sendAccessDeniedResponseMessage({ tabId, messageId: message.id });
    return;
  }

  const {
    selectedAccountIndex,
    selectedAccountType,
    accountsList: softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
  } = rootStore.store.getState().walletState;

  const account = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
  });

  if (!account) {
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
    return;
  }

  sendGetAddressesSuccessResponseMessage({
    tabId,
    messageId: message.id,
    result: {
      addresses: [
        {
          address: account.stxAddress,
          publicKey: account.stxPublicKey,
          addressType: AddressType.stacks,
          purpose: AddressPurpose.Stacks,
        },
      ],
    },
  });
};

export default handleGetStxAddresses;
