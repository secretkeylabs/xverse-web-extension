/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount, { embellishAccountWithDetails } from '@common/utils/getSelectedAccount';
import { type GetAddressesRequestMessage } from '@sats-connect/core';
import rootStore from '@stores/index';
import { sendGetAddressesSuccessResponseMessage } from '../../responseMessages/bitcoin';
import { sendInternalErrorMessage } from '../../responseMessages/errors';
import { accountPurposeAddresses } from './utils';

export const handleGetAddresses = async (
  message: GetAddressesRequestMessage,
  port: chrome.runtime.Port,
) => {
  const tabId = getTabIdFromPort(port);

  const {
    selectedAccountIndex,
    selectedAccountType,
    accountsList: softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
    btcPaymentAddressType,
  } = rootStore.store.getState().walletState;

  const account = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
  });

  if (!account) {
    sendInternalErrorMessage({ tabId, messageId: message.id });
    return;
  }

  const embellishedAccount = embellishAccountWithDetails(account, btcPaymentAddressType);
  const addresses = accountPurposeAddresses(embellishedAccount, {
    type: 'select',
    purposes: message.params.purposes,
  });
  sendGetAddressesSuccessResponseMessage({
    tabId,
    messageId: message.id,
    result: {
      addresses,
    },
  });
};
