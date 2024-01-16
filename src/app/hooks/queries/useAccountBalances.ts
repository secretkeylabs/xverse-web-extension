import { delay } from '@common/utils/ledger';
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

// fetch as user scrolls and cache it

const useAccountBalances = (accounts: Account[]) => {
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
    const balances = {};

    accounts.slice(0, 10).forEach(async (account) => {
      await delay(2000);
      const btcData: BtcAddressData = await btcClient.getBalance(account.btcAddress);
      const btcBalance = btcData.finalBalance;

      // TODO: Uncomment this code when the Hiro API rate limit is handled
      // const stxData: StxAddressData = await fetchStxAddressData(
      //   account.stxAddress,
      //   stacksNetworkInstance,
      //   0,
      //   PAGINATION_LIMIT,
      // );
      // const stxBalance = stxData.balance.toNumber();
      const stxBalance = 0;

      balances[account.id] = calculateTotalBalance(btcBalance, stxBalance);
    });

    return balances;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['accounts-balances'],
    queryFn: fetchBalances,
    staleTime: 5 * 60 * 1000, // 5 mins
  });

  return {
    data,
    isLoading,
    error,
  };
};

export default useAccountBalances;
