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
    btcPaymentAddressType,
  } = useWalletSelector();

  return useMemo(() => {
    let account = getSelectedAccount({
      selectedAccountIndex,
      selectedAccountType,
      softwareAccountsList,
      ledgerAccountsList,
    });

    if (!account) {
      [account] = softwareAccountsList;
      if (account) {
        switchAccount(account);
      }
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
    switchAccount,
    btcPaymentAddressType,
    overridePayAddressType,
  ]);
};

export default useSelectedAccount;
