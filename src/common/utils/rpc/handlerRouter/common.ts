import getSelectedAccount from '@common/utils/getSelectedAccount';
import { permissions } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';

/* eslint-disable import/prefer-default-export */
export function getCurrentAccountResourceId() {
  const {
    selectedAccountIndex,
    selectedAccountType,
    accountsList: softwareAccountsList,
    ledgerAccountsList,
    network,
  } = rootStore.store.getState().walletState;

  const existingAccount = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    softwareAccountsList,
    ledgerAccountsList,
  });

  if (!existingAccount) {
    throw new Error('Could not find selected account.', {
      cause: {
        selectedAccountIndex,
        selectedAccountType,
        softwareAccountsList,
        ledgerAccountsList,
      },
    });
  }

  const accountId = permissions.utils.account.makeAccountId({
    accountId: selectedAccountIndex,
    masterPubKey: existingAccount.masterPubKey,
    networkType: network.type,
  });

  const accountResourceId = permissions.resources.account.makeAccountResourceId(accountId);

  return accountResourceId;
}
