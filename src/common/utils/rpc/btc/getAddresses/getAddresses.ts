/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext, openPopup } from '@common/utils/popup';
import * as utils from '@components/permissionsManager/utils';
import { getAddressesRequestMessageSchema, type RpcRequestMessage } from '@sats-connect/core';
import rootStore from '@stores/index';
import * as v from 'valibot';
import RequestsRoutes from '../../../route-urls';
import { handleInvalidMessage } from '../../handle-invalid-message';
import { hasAccountReadPermissions, makeSendPopupClosedUserRejectionMessage } from '../../helpers';
import { sendGetAddressesSuccessResponseMessage } from '../../responseMessages/bitcoin';
import { sendInternalErrorMessage } from '../../responseMessages/errors';
import { accountPurposeAddresses } from './utils';

export const handleGetAddresses = async (message: RpcRequestMessage, port: chrome.runtime.Port) => {
  const parseResult = v.safeParse(getAddressesRequestMessageSchema, message);
  if (!parseResult.success) {
    handleInvalidMessage(message, getTabIdFromPort(port), parseResult.issues);
    return;
  }

  const { origin, tabId } = makeContext(port);

  const [error, store] = await utils.getPermissionsStore();
  if (error) {
    sendInternalErrorMessage({
      tabId,
      messageId: parseResult.output.id,
      message: 'Error loading permissions store.',
    });
    return;
  }

  if (!hasAccountReadPermissions(origin, store)) {
    await openPopup({
      path: RequestsRoutes.AddressRequest,
      data: parseResult.output,
      context: makeContext(port),
      onClose: makeSendPopupClosedUserRejectionMessage({
        tabId: getTabIdFromPort(port),
        messageId: parseResult.output.id,
      }),
    });
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
    sendInternalErrorMessage({ tabId, messageId: parseResult.output.id });
    return;
  }

  const addresses = accountPurposeAddresses(account, parseResult.output.params.purposes);
  sendGetAddressesSuccessResponseMessage({
    tabId,
    messageId: message.id,
    result: {
      addresses,
    },
  });
};
