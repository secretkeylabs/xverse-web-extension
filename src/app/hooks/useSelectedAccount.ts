import getSelectedAccount, {
  embellishAccountWithDetails,
  type AccountWithDetails,
} from '@common/utils/getSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import type { BtcPaymentType } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletReducer from './useWalletReducer';

const useSelectedAccount = (overridePayAddressType?: BtcPaymentType): AccountWithDetails => {
  const { switchAccount } = useWalletReducer();
  const {
    selectedAccountIndex,
    selectedAccountType,
    selectedWalletId,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    btcPaymentAddressType,
    network,
  } = useWalletSelector();

  return useMemo(() => {
    let account = getSelectedAccount({
      selectedAccountIndex,
      selectedAccountType,
      selectedWalletId,
      softwareWallets,
      ledgerAccountsList,
      keystoneAccountsList,
      network: network.type,
    });

    if (!account) {
      const firstWalletWithAccounts = softwareWallets[network.type].find(
        (w) => w.accounts.length > 0,
      );
      [account] = firstWalletWithAccounts?.accounts || [];
      if (!account) {
        // this should never happen
        // if it does, then this hook is being called before onboarding is complete, which is a bug
        // and should be picked up during dev time
        throw new Error('No account found');
      }
      switchAccount(account);
    }

    let accountType = btcPaymentAddressType;

    if (overridePayAddressType) {
      switch (overridePayAddressType) {
        case 'nested':
          if (account.btcAddresses.nested) {
            accountType = overridePayAddressType;
          }
          break;
        case 'native':
          if (account.btcAddresses.native) {
            accountType = overridePayAddressType;
          }
          break;
        default:
          break;
      }
    }

    return embellishAccountWithDetails(account, accountType);
  }, [
    selectedAccountIndex,
    selectedAccountType,
    selectedWalletId,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    switchAccount,
    btcPaymentAddressType,
    overridePayAddressType,
    network.type,
  ]);
};

export default useSelectedAccount;
