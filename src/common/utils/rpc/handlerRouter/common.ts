import getSelectedAccount from '@common/utils/getSelectedAccount';
import { permissions } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';

/* eslint-disable import/prefer-default-export */
export function getCurrentAccountResourceId() {
  const {
    selectedAccountIndex,
    selectedAccountType,
    selectedWalletId,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    network,
  } = rootStore.store.getState().walletState;

  const existingAccount = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    selectedWalletId,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    network: network.type,
  });

  if (!existingAccount) {
    throw new Error('Could not find selected account.', {
      cause: {
        selectedAccountIndex,
        selectedAccountType,
        selectedWalletId,
        softwareWallets,
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
