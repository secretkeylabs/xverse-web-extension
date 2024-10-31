import useBtcAddressBalance from '@hooks/useBtcAddressBalance';
import useSelectedAccount from '@hooks/useSelectedAccount';
import BigNumber from 'bignumber.js';

export default function useSelectedAccountBtcBalance() {
  const selectedAccount = useSelectedAccount();
  const {
    data: nativeBalance,
    isLoading: nativeLoading,
    isRefetching: nativeRefetching,
  } = useBtcAddressBalance(selectedAccount.btcAddresses.native?.address ?? '');
  const {
    data: nestedBalance,
    isLoading: nestedLoading,
    isRefetching: nestedRefetching,
  } = useBtcAddressBalance(selectedAccount.btcAddresses.nested?.address ?? '');
  const {
    data: taprootBalance,
    isLoading: taprootLoading,
    isRefetching: taprootRefetching,
  } = useBtcAddressBalance(selectedAccount.btcAddresses.taproot.address ?? '');

  if (nativeLoading || nestedLoading || taprootLoading) {
    return { isLoading: true, isRefetching: false };
  }

  const confirmedPaymentBalance = BigNumber(nativeBalance?.confirmedBalance ?? 0)
    .plus(nestedBalance?.confirmedBalance ?? 0)
    .toNumber();

  const unconfirmedPaymentBalance = BigNumber(nativeBalance?.unconfirmedBalance ?? 0)
    .plus(nestedBalance?.unconfirmedBalance ?? 0)
    .toNumber();

  return {
    confirmedPaymentBalance,
    unconfirmedPaymentBalance,
    nativeBalance,
    nestedBalance,
    taprootBalance,
    isLoading: false,
    isRefetching: nativeRefetching || nestedRefetching || taprootRefetching,
  };
}
