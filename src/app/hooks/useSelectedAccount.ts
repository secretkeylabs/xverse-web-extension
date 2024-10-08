import getSelectedAccount from '@common/utils/getSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import type { Account } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletReducer from './useWalletReducer';

const useSelectedAccount = (): Account => {
  const { switchAccount } = useWalletReducer();
  const {
    selectedAccountIndex,
    selectedAccountType,
    accountsList: softwareAccountsList,
    ledgerAccountsList,
  } = useWalletSelector();

  return useMemo(() => {
    const existingAccount = getSelectedAccount({
      selectedAccountIndex,
      selectedAccountType,
      softwareAccountsList,
      ledgerAccountsList,
    });
    if (existingAccount) {
      return existingAccount;
    }
    const fallbackAccount = softwareAccountsList[0];
    if (fallbackAccount) {
      switchAccount(fallbackAccount);
    }
    return fallbackAccount;
  }, [
    selectedAccountIndex,
    selectedAccountType,
    softwareAccountsList,
    ledgerAccountsList,
    switchAccount,
  ]);
};

export default useSelectedAccount;
