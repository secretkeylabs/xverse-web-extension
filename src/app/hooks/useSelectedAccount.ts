import getSelectedAccount from '@common/utils/getSelectedAccount';
import { StoreState } from '@stores/index';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useWalletReducer from './useWalletReducer';

const useSelectedAccount = () => {
  const { switchAccount } = useWalletReducer();

  const selectedAccountIndex = useSelector(
    (state: StoreState) => state.walletState.selectedAccountIndex,
  );
  const selectedAccountType = useSelector(
    (state: StoreState) => state.walletState.selectedAccountType,
  );
  const softwareAccountsList = useSelector((state: StoreState) => state.walletState.accountsList);
  const ledgerAccountsList = useSelector(
    (state: StoreState) => state.walletState.ledgerAccountsList,
  );

  const selectedAccount = useMemo(() => {
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

    switchAccount(fallbackAccount);

    return fallbackAccount;
  }, [
    selectedAccountIndex,
    selectedAccountType,
    softwareAccountsList,
    ledgerAccountsList,
    switchAccount,
  ]);

  return selectedAccount;
};

export default useSelectedAccount;
