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
    accountsList: softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
    btcPaymentAddressType,
  } = useWalletSelector();

  return useMemo(() => {
    let account = getSelectedAccount({
      selectedAccountIndex,
      selectedAccountType,
      softwareAccountsList,
      ledgerAccountsList,
      keystoneAccountsList,
    });

    if (!account) {
      [account] = softwareAccountsList;
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
    softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
    switchAccount,
    btcPaymentAddressType,
    overridePayAddressType,
  ]);
};

export default useSelectedAccount;
