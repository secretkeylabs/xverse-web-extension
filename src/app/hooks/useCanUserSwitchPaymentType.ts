import useSelectedAccount from './useSelectedAccount';
import useWalletSelector from './useWalletSelector';

export default function useCanUserSwitchPaymentType() {
  const selectedAccount = useSelectedAccount();
  const { allowNestedSegWitAddress, selectedAccountType } = useWalletSelector();
  return !!(
    allowNestedSegWitAddress &&
    selectedAccountType !== 'ledger' &&
    selectedAccount.btcAddresses.native &&
    selectedAccount.btcAddresses.nested
  );
}
