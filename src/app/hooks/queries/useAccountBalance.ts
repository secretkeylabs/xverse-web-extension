import useBtcClient from '@hooks/apiClients/useBtcClient';
import useRunesApi from '@hooks/apiClients/useRunesApi';
import useXverseApi from '@hooks/apiClients/useXverseApi';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  API_TIMEOUT_MILLI,
  getFungibleTokenStates,
  type Account,
  type BtcAddressData,
  type FungibleToken,
  type FungibleTokenWithStates,
  type TokensResponse,
} from '@secretkeylabs/xverse-core';
import { setAccountBalanceAction } from '@stores/wallet/actions/actionCreators';
import { calculateTotalBalance, getAccountBalanceKey } from '@utils/helper';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchBrc20FungibleTokens } from './ordinals/useGetBrc20FungibleTokens';
import { fetchRuneBalances } from './runes/useRuneFungibleTokensQuery';
import { fetchSip10FungibleTokens } from './stx/useGetSip10FungibleTokens';

const useAccountBalance = () => {
  const btcClient = useBtcClient();
  const xverseApiClient = useXverseApi();
  const stacksNetwork = useNetworkSelector();
  const { fiatCurrency, network, hideStx, sip10ManageTokens, spamTokens, showSpamTokens } =
    useWalletSelector();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const runesApi = useRunesApi();
  const dispatch = useDispatch();
  const queue = useRef<Account[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  const withDerivedState = (ft: FungibleToken) =>
    ({
      ...ft,
      ...getFungibleTokenStates({
        fungibleToken: ft,
        manageTokens: sip10ManageTokens,
        spamTokens,
        showSpamTokens,
      }),
    } as FungibleTokenWithStates);

  const fetchBalances = async (account: Account | null) => {
    if (!account) {
      return;
    }

    let btcBalance = '0';
    let stxBalance = '0';
    let finalSipCoinsList: FungibleTokenWithStates[] = [];
    let finalBrcCoinsList: FungibleTokenWithStates[] = [];
    let finalRunesCoinsList: FungibleTokenWithStates[] = [];

    try {
      const getBtcBalance = async (address?: string) => {
        if (!address) {
          return '0';
        }
        const btcData: BtcAddressData = await btcClient.getBalance(address);
        return btcData.finalBalance.toString();
      };

      const [nativeBalance, nestedBalance] = await Promise.all([
        getBtcBalance(account.btcAddresses.native?.address),
        getBtcBalance(account.btcAddresses.nested?.address),
      ]);
      btcBalance = BigNumber(nativeBalance).plus(nestedBalance).toString();

      if (account.btcAddresses.taproot.address) {
        const fetchBrc20Balances = fetchBrc20FungibleTokens(
          account.btcAddresses.taproot.address,
          fiatCurrency,
          network,
          xverseApiClient,
        );
        finalBrcCoinsList = (await fetchBrc20Balances())
          .map(withDerivedState)
          .filter((ft) => ft.isEnabled);
        const runeBalances = fetchRuneBalances(
          runesApi,
          account.btcAddresses.taproot.address,
          fiatCurrency,
        );
        finalRunesCoinsList = (await runeBalances())
          .map(withDerivedState)
          .filter((ft) => ft.isEnabled);
      }
      if (account.stxAddress) {
        const apiUrl = `${stacksNetwork.client.baseUrl}/extended/v1/address/${account.stxAddress}/balances`;

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
          xverseApiClient,
        );
        finalSipCoinsList = (await fetchSip10Balances())
          .map(withDerivedState)
          .filter((ft) => ft.isEnabled);
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }

    const totalBalance = calculateTotalBalance({
      stxBalance,
      btcBalance,
      sipCoinsList: finalSipCoinsList,
      brcCoinsList: finalBrcCoinsList,
      runesCoinList: finalRunesCoinsList,
      stxBtcRate,
      btcFiatRate,
      hideStx,
    });

    dispatch(setAccountBalanceAction(getAccountBalanceKey(account), totalBalance));
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
      dispatch(setAccountBalanceAction(getAccountBalanceKey(account), balance));
    }
  };

  return { enqueueFetchBalances, setAccountBalance };
};

export default useAccountBalance;
