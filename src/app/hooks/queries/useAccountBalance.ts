import useBtcClient from '@hooks/useBtcClient';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  Account,
  BtcAddressData,
  StxAddressData,
  fetchStxAddressData,
  microstacksToStx,
  satsToBtc,
} from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { PAGINATION_LIMIT } from '@utils/constants';
import BigNumber from 'bignumber.js';

const useAccountBalance = (account: Account | null, shouldFetch: boolean) => {
  const btcClient = useBtcClient();
  const stacksNetworkInstance = useNetworkSelector();
  const { btcFiatRate, stxBtcRate } = useWalletSelector();

  const calculateTotalBalance = (btcBalance?: number, stxBalance?: number): string => {
    let totalBalance = BigNumber(0);

    if (btcBalance) {
      const btcFiatEquiv = satsToBtc(BigNumber(btcBalance)).multipliedBy(BigNumber(btcFiatRate));
      totalBalance = totalBalance.plus(btcFiatEquiv);
    }

    if (stxBalance) {
      const stxFiatEquiv = microstacksToStx(BigNumber(stxBalance))
        .multipliedBy(BigNumber(stxBtcRate))
        .multipliedBy(BigNumber(btcFiatRate));
      totalBalance = totalBalance.plus(stxFiatEquiv);
    }

    return totalBalance.toNumber().toFixed(2);
  };

  const fetchBalances = async () => {
    const btcData: BtcAddressData = await btcClient.getBalance(account!.btcAddress);
    const btcBalance = btcData.finalBalance;

    const stxData: StxAddressData = await fetchStxAddressData(
      account!.stxAddress,
      stacksNetworkInstance,
      0,
      PAGINATION_LIMIT,
    );
    const stxBalance = stxData.balance.toNumber();

    return calculateTotalBalance(btcBalance, stxBalance);
  };

  return useQuery({
    queryKey: ['account-balance', account?.btcAddress],
    queryFn: fetchBalances,
    staleTime: 5 * 60 * 1000, // 5 mins
    enabled: !!account && shouldFetch,
  });
};

export default useAccountBalance;
