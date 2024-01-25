import useBtcClient from '@hooks/useBtcClient';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  API_TIMEOUT_MILLI,
  Account,
  BtcAddressData,
  FungibleToken,
  TokensResponse,
  getBrc20Tokens,
  getCoinsInfo,
  getNetworkURL,
  getOrdinalsFtBalance,
} from '@secretkeylabs/xverse-core';
import { setAccountBalanceAction } from '@stores/wallet/actions/actionCreators';
import { calculateTotalBalance } from '@utils/helper';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { brc20TokenToFungibleToken } from './useBtcCoinsBalance';

const useAccountBalance = () => {
  const btcClient = useBtcClient();
  const stacksNetwork = useNetworkSelector();
  const { btcFiatRate, stxBtcRate, fiatCurrency, network, coinsList, brcCoinsList, hideStx } =
    useWalletSelector();
  const dispatch = useDispatch();
  const queue = useRef<Account[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  const fetchBrcCoinsBalances = async (ordinalsAddress: string) => {
    try {
      const ordinalsFtBalance = await getOrdinalsFtBalance(network.type, ordinalsAddress);
      const brc20Tokens = await getBrc20Tokens(
        network.type,
        ordinalsFtBalance?.map((o) => o.ticker!) ?? [],
        fiatCurrency,
      );

      const brcCoinsListMap = new Map(brcCoinsList?.map((token) => [token.ticker, token]));

      const mergedList: FungibleToken[] = ordinalsFtBalance.map((newToken) => {
        const existingToken = brcCoinsListMap.get(newToken.ticker);

        const reconstitutedFt = {
          ...existingToken,
          ...newToken,
          // The `visible` property from `xverse-core` defaults to true.
          // We override `visible` to ensure that the existing state is preserved.
          ...(existingToken ? { visible: existingToken.visible } : {}),
        };

        return reconstitutedFt;
      });

      brc20Tokens?.forEach((b) => {
        const existingToken = brcCoinsListMap.get(b.ticker);
        const pendingToken = mergedList?.find((m) => m.ticker === b.ticker);
        const tokenFiatRate = Number(b?.tokenFiatRate);

        // No duplicates
        if (pendingToken) {
          pendingToken.tokenFiatRate = tokenFiatRate;
          return;
        }

        if (existingToken) {
          mergedList.push({
            ...existingToken,
            tokenFiatRate,
          });
        } else {
          mergedList.push(brc20TokenToFungibleToken(b));
        }
      });

      return mergedList;
    } catch (e: any) {
      return Promise.reject(e);
    }
  };

  const fetchBalances = async (account: Account | null) => {
    if (!account) {
      return;
    }

    let btcBalance = '0';
    let stxBalance = '0';
    let ftCoinList: FungibleToken[] | null = null;
    let finalBrcCoinList: FungibleToken[] | null = null;

    if (account.btcAddress) {
      const btcData: BtcAddressData = await btcClient.getBalance(account.btcAddress);
      btcBalance = btcData.finalBalance.toString();
    }

    if (account.ordinalsAddress) {
      finalBrcCoinList = await fetchBrcCoinsBalances(account.ordinalsAddress);
    }

    if (account.stxAddress) {
      const apiUrl = `${getNetworkURL(stacksNetwork)}/extended/v1/address/${
        account.stxAddress
      }/balances`;

      const response = await axios.get<TokensResponse>(apiUrl, {
        timeout: API_TIMEOUT_MILLI,
      });

      const availableBalance = new BigNumber(response.data.stx.balance);
      const lockedBalance = new BigNumber(response.data.stx.locked);
      stxBalance = availableBalance.plus(lockedBalance).toString();

      const fungibleTokenList: FungibleToken[] = [];
      Object.entries(response.data.fungible_tokens).forEach(([key, value]: [string, any]) => {
        const fungibleToken: FungibleToken = value;
        const index = key.indexOf('::');
        fungibleToken.assetName = key.substring(index + 2);
        fungibleToken.principal = key.substring(0, index);
        fungibleToken.protocol = 'stacks';
        fungibleTokenList.push(fungibleToken);
      });

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
      ftCoinList,
      brcCoinsList: finalBrcCoinList,
      stxBtcRate,
      btcFiatRate,
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

  const setAccountBalance = (account: Account | null, balance: string) => {
    if (account) {
      dispatch(setAccountBalanceAction(account.btcAddress, balance));
    }
  };

  return { enqueueFetchBalances, setAccountBalance };
};

export default useAccountBalance;
