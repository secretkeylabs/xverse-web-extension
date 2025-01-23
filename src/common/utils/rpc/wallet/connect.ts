/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount, { embellishAccountWithDetails } from '@common/utils/getSelectedAccount';
import { initPermissionsStore } from '@common/utils/permissionsStore';
import { makeContext, openPopup } from '@common/utils/popup';
import { type ConnectRequestMessage, type ConnectResult } from '@sats-connect/core';
import { permissions } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import RequestsRoutes from '../../route-urls';
import { accountPurposeAddresses } from '../btc/getAddresses/utils';
import { makeSendPopupClosedUserRejectionMessage } from '../helpers';
import { sendInternalErrorMessage } from '../responseMessages/errors';
import { sendConnectSuccessResponseMessage } from '../responseMessages/wallet';

export const handleConnect = async (message: ConnectRequestMessage, port: chrome.runtime.Port) => {
  // Check if the user already has account read permissions, and if so, return
  // the account data without opening the popup.
  const [error, store] = await initPermissionsStore();
  if (error) {
    sendInternalErrorMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
      message: 'Error loading permissions store.',
    });
    return;
  }

  const {
    selectedAccountIndex,
    selectedAccountType,
    accountsList: softwareAccountsList,
    ledgerAccountsList,
    network,
    btcPaymentAddressType,
  } = rootStore.store.getState().walletState;

  const account = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    softwareAccountsList,
    ledgerAccountsList,
  });

  if (!account) {
    sendInternalErrorMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
      message: 'Failed to get selected account.',
    });
    return;
  }

  const [clientIdError, clientId] = permissions.utils.store.makeClientId({ origin });
  if (clientIdError) {
    sendInternalErrorMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
      message: 'Failed to create client ID during permissons check.',
    });
    return;
  }

  const accountId = permissions.utils.account.makeAccountId({
    accountId: account.id,
    masterPubKey: account.masterPubKey,
    networkType: network.type,
  });
  const resourceId = permissions.resources.account.makeAccountResourceId(accountId);

  const hasAccountReadPermissions = permissions.utils.store.hasPermission(store, {
    type: 'account',
    clientId,
    resourceId,
    actions: { read: true },
  });

  if (!hasAccountReadPermissions) {
    openPopup({
      path: RequestsRoutes.ConnectionRequest,
      data: message,
      context: makeContext(port),
      onClose: makeSendPopupClosedUserRejectionMessage({
        tabId: getTabIdFromPort(port),
        messageId: message.id,
      }),
    });
    return;
  }

  const embellishedAccount = embellishAccountWithDetails(account, btcPaymentAddressType);
  const addresses = accountPurposeAddresses(embellishedAccount, { type: 'all' });
  const result: ConnectResult = {
    id: accountId,
    walletType: account.accountType ?? 'software',
    addresses,
  };
  sendConnectSuccessResponseMessage({
    tabId: getTabIdFromPort(port),
    messageId: message.id,
    result,
  });
};
