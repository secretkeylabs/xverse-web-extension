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
} from '@secretkeylabs/xverse-core';
import { setAccountBalanceAction } from '@stores/wallet/actions/actionCreators';
import { calculateTotalBalance } from '@utils/helper';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

const useAccountBalance = () => {
  const btcClient = useBtcClient();
  const stacksNetwork = useNetworkSelector();
  const { btcFiatRate, stxBtcRate, fiatCurrency, network, coinsList, hideStx } =
    useWalletSelector();
  const dispatch = useDispatch();
  const queue = useRef<Account[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  const fetchBalances = async (account: Account | null) => {
    if (!account) {
      return;
    }

    let btcBalance = '0';
    let stxBalance = '0';
    let ftCoinList: FungibleToken[] | null = null;

    if (account.btcAddress) {
      const btcData: BtcAddressData = await btcClient.getBalance(account.btcAddress);
      btcBalance = btcData.finalBalance.toString();
    }

    if (account.stxAddress) {
      const apiUrl = `${getNetworkURL(stacksNetwork)}/v2/accounts/${account.stxAddress}?proof=0`;

      const balanceInfo = await axios.get<StxAddressDataResponse>(apiUrl, {
        timeout: API_TIMEOUT_MILLI,
      });

      const availableBalance = new BigNumber(balanceInfo.data.balance);
      const lockedBalance = new BigNumber(balanceInfo.data.locked);
      stxBalance = availableBalance.plus(lockedBalance).toString();

      const fungibleTokenList = await getFtData(account.stxAddress, stacksNetwork);

      const visibleCoins: FungibleToken[] | null = coinsList;
      if (visibleCoins) {
        visibleCoins.forEach((visibleCoin) => {
          const coinToBeUpdated = fungibleTokenList.find(
            (ft) => ft.principal === visibleCoin.principal,
          );
          if (coinToBeUpdated) coinToBeUpdated.visible = visibleCoin.visible;
          else if (visibleCoin.visible) {
            visibleCoin.balance = '0';
            fungibleTokenList.push(visibleCoin);
          }
        });
      } else {
        fungibleTokenList.forEach((ft) => {
          ft.visible = true;
        });
      }

      const contractids: string[] = fungibleTokenList.map((ft) => ft.principal);

      const coinsResponse = await getCoinsInfo(network.type, contractids, fiatCurrency);

      if (coinsResponse) {
        coinsResponse.forEach((coin) => {
          if (!coin.name) {
            const coinName = coin.contract.split('.')[1];
            coin.name = coinName;
          }
        });

        // update attributes of fungible token list
        fungibleTokenList.forEach((ft) => {
          coinsResponse.forEach((coin) => {
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

        ftCoinList = fungibleTokenList;
      }
    }

    const totalBalance = calculateTotalBalance({
      stxBalance,
      btcBalance,
      stxBtcRate,
      btcFiatRate,
      ftCoinList,
      hideStx,
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
