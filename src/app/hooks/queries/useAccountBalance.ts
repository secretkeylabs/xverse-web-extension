import useBtcClient from '@hooks/useBtcClient';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  API_TIMEOUT_MILLI,
  Account,
  BtcAddressData,
  FungibleToken,
  StxAddressDataResponse,
  getCoinMetaData,
  getCoinsInfo,
  getFtData,
  getNetworkURL,
  microstacksToStx,
  satsToBtc,
} from '@secretkeylabs/xverse-core';
import { setAccountBalanceAction } from '@stores/wallet/actions/actionCreators';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

const useAccountBalance = () => {
  const btcClient = useBtcClient();
  const stacksNetwork = useNetworkSelector();
  const { btcFiatRate, stxBtcRate, fiatCurrency, network } = useWalletSelector();
  const dispatch = useDispatch();
  const queue = useRef<Account[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  const calculateTotalBalance = ({
    btcBalance,
    stxBalance,
    coinsList,
  }: {
    btcBalance?: number;
    stxBalance?: number;
    coinsList?: FungibleToken[];
  }): string => {
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

    if (coinsList) {
      totalBalance = coinsList.reduce((acc, coin) => {
        if (coin.tokenFiatRate && coin.decimals) {
          const tokenUnits = new BigNumber(10).exponentiatedBy(new BigNumber(coin.decimals));
          const coinFiatValue = new BigNumber(coin.balance)
            .dividedBy(tokenUnits)
            .multipliedBy(new BigNumber(coin.tokenFiatRate));
          return acc.plus(coinFiatValue);
        }

        return acc;
      }, totalBalance);
    }

    return totalBalance.toNumber().toFixed(2);
  };

  const fetchBalances = async (account: Account | null) => {
    if (!account) {
      return;
    }

    let btcBalance = 0;
    let stxBalance = 0;
    let coinsList: FungibleToken[] | undefined;

    if (account.btcAddress) {
      const btcData: BtcAddressData = await btcClient.getBalance(account.btcAddress);
      btcBalance = btcData.finalBalance;
    }

    if (account.stxAddress) {
      const apiUrl = `${getNetworkURL(stacksNetwork)}/v2/accounts/${account.stxAddress}?proof=0`;

      const balanceInfo = await axios.get<StxAddressDataResponse>(apiUrl, {
        timeout: API_TIMEOUT_MILLI,
      });

      const availableBalance = new BigNumber(balanceInfo.data.balance);
      const lockedBalance = new BigNumber(balanceInfo.data.locked);
      stxBalance = availableBalance.plus(lockedBalance).toNumber();

      const fungibleTokenList = await getFtData(account.stxAddress, stacksNetwork);
      const contractids: string[] = fungibleTokenList.map((ft) => ft.principal);

      let coinsResponse = await getCoinsInfo(network.type, contractids, fiatCurrency);
      if (!coinsResponse) {
        coinsResponse = await getCoinMetaData(contractids, stacksNetwork);
      }

      coinsResponse.forEach((coin) => {
        if (!coin.name) {
          const coinName = coin.contract.split('.')[1];
          coin.name = coinName;
        }
      });

      // update attributes of fungible token list
      fungibleTokenList.forEach((ft) => {
        coinsResponse!.forEach((coin) => {
          if (ft.principal === coin.contract) {
            ft.ticker = coin.ticker;
            ft.decimals = coin.decimals;
            ft.supported = coin.supported;
            ft.image = coin.image;
            ft.name = coin.name;
            ft.tokenFiatRate = coin.tokenFiatRate;
            coin.visible = ft.visible;
          }
        });
      });

      coinsList = fungibleTokenList;
    }
    console.log('getFtData > coinsList', coinsList);

    const totalBalance = calculateTotalBalance({
      btcBalance,
      stxBalance,
      coinsList,
    });
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

  const enqueueFetchBalances = (account: Account | null) => {
    if (!account) {
      return;
    }

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
