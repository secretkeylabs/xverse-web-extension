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
import { PAGINATION_LIMIT } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

const useAccountBalance = () => {
  const btcClient = useBtcClient();
  const stacksNetworkInstance = useNetworkSelector();
  const { btcFiatRate, stxBtcRate } = useWalletSelector();
  const dispatch = useDispatch();
  const queue = useRef<Account[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

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

  const fetchBalances = async (account: Account | null) => {
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

  const processQueue = async () => {
    if (queue.current.length === 0) {
      setIsProcessingQueue(false);
      return;
    }

    const account = queue.current.shift() || null;
    await fetchBalances(account);
    setQueueLength(queue.current.length);

    setTimeout(processQueue, 1000);
  };

  useEffect(() => {
    if (!isProcessingQueue && queue.current.length > 0) {
      setIsProcessingQueue(true);
      processQueue();
    }
  }, [queueLength]);

  const enqueueFetchBalances = (account: Account) => {
    queue.current.push(account);
    setQueueLength(queue.current.length);
    if (!isProcessingQueue) {
      setIsProcessingQueue(true);
      processQueue();
    }
  };

  return { enqueueFetchBalances };
};

export default useAccountBalance;
