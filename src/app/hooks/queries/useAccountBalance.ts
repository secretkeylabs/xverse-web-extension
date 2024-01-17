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
import { setAccountBalanceAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { PAGINATION_LIMIT } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

const useAccountBalance = (account: Account | null, shouldFetch: boolean) => {
  const btcClient = useBtcClient();
  const stacksNetworkInstance = useNetworkSelector();
  const { btcFiatRate, stxBtcRate, accountBalances } = useWalletSelector();
  const dispatch = useDispatch();

  const oldFetchedBalance = accountBalances[account?.btcAddress || ''];

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
    if (!account) {
      return;
    }
    console.log('fetching balances...');

    let btcBalance = 0;
    let stxBalance = 0;

    if (account.btcAddress) {
      const btcData: BtcAddressData = await btcClient.getBalance(account?.btcAddress);
      btcBalance = btcData.finalBalance;
    }

    if (account.stxAddress) {
      const stxData: StxAddressData = await fetchStxAddressData(
        account?.stxAddress,
        stacksNetworkInstance,
        0,
        PAGINATION_LIMIT,
      );
      stxBalance = stxData.balance.toNumber();
    }

    const totalBalance = calculateTotalBalance(btcBalance, stxBalance);
    dispatch(setAccountBalanceAction(account.btcAddress, totalBalance));
    return totalBalance;
  };

  const debouncedFetchBalances = useCallback(debounce(fetchBalances, 2000), [account, shouldFetch]);

  useEffect(() => {
    if (!account || !shouldFetch || !!oldFetchedBalance) return;

    debouncedFetchBalances();
  }, [debouncedFetchBalances]);

  return useQuery({
    queryKey: ['account-balance', account?.btcAddress],
    queryFn: fetchBalances,
    staleTime: 5 * 60 * 1000, // 5 mins
    enabled: !!account && shouldFetch && !oldFetchedBalance,
    retryDelay: 10000, // 10 secs
  });
};

export default useAccountBalance;
