/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount, { embellishAccountWithDetails } from '@common/utils/getSelectedAccount';
import { type GetAddressesRequestMessage } from '@sats-connect/core';
import rootStore from '@stores/index';
import { getBitcoinNetworkType } from '../../helpers';
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
    selectedWalletId,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    btcPaymentAddressType,
    network,
  } = rootStore.store.getState().walletState;

  const account = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    selectedWalletId,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    network: network.type,
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
      network: {
        bitcoin: {
          name: getBitcoinNetworkType(network.type),
        },
        stacks: {
          name: getBitcoinNetworkType(network.type),
        },
      },
    },
  });
};
