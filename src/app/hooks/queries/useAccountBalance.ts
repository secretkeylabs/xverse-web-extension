import useCoinRates from '@hooks/queries/useCoinRates';
import useBtcClient from '@hooks/useBtcClient';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  Account,
  API_TIMEOUT_MILLI,
  BtcAddressData,
  FungibleToken,
  getNetworkURL,
  TokensResponse,
} from '@secretkeylabs/xverse-core';
import { setAccountBalanceAction } from '@stores/wallet/actions/actionCreators';
import { calculateTotalBalance } from '@utils/helper';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchBrc20FungibleTokens } from './ordinals/useGetBrc20FungibleTokens';
import { fetchSip10FungibleTokens } from './stx/useGetSip10FungibleTokens';

const useAccountBalance = () => {
  const btcClient = useBtcClient();
  const stacksNetwork = useNetworkSelector();
  const { fiatCurrency, network, hideStx, brc20ManageTokens, sip10ManageTokens } =
    useWalletSelector();
  const { btcFiatRate, stxBtcRate } = useCoinRates();
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
    let finalSipCoinsList: FungibleToken[] = [];
    let finalBrcCoinsList: FungibleToken[] = [];

    if (account.btcAddress) {
      const btcData: BtcAddressData = await btcClient.getBalance(account.btcAddress);
      btcBalance = btcData.finalBalance.toString();
    }

    if (account.ordinalsAddress) {
      const fetchBrc20Balances = fetchBrc20FungibleTokens(
        account.ordinalsAddress,
        fiatCurrency,
        network,
      );
      finalBrcCoinsList = (await fetchBrc20Balances()).filter(
        (ft) => brc20ManageTokens[ft.principal] !== false,
      );
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

      const fetchSip10Balances = fetchSip10FungibleTokens(
        account.stxAddress,
        fiatCurrency,
        network,
        stacksNetwork,
      );
      finalSipCoinsList = (await fetchSip10Balances()).filter(
        (ft) => sip10ManageTokens[ft.principal] !== false,
      );
    }

    const totalBalance = calculateTotalBalance({
      stxBalance,
      btcBalance,
      sipCoinsList: finalSipCoinsList,
      brcCoinsList: finalBrcCoinsList,
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
