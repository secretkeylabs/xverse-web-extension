import useSelectedAccount from './useSelectedAccount';
import useWalletSelector from './useWalletSelector';

export default function useCanUserSwitchPaymentType() {
  const selectedAccount = useSelectedAccount();
  const { selectedAccountType } = useWalletSelector();
  return !!(
    selectedAccountType !== 'ledger' &&
    selectedAccount.btcAddresses.native &&
    selectedAccount.btcAddresses.nested
  );
}
