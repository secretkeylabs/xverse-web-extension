import useWalletSelector from '@hooks/useWalletSelector';
import {
  Coin,
  CoinsResponse,
  FungibleToken,
  getOrdinalsFtBalance,
} from '@secretkeylabs/xverse-core';
import { setBrcCoinsDataAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';

const coinToFungibleToken = (coin: Coin): FungibleToken => ({
  name: coin.name,
  principal: coin.ticker ?? coin.name,
  balance: '0',
  total_sent: '',
  total_received: '',
  assetName: coin.ticker ?? coin.name,
  visible: coin.visible ?? false,
  ticker: coin.ticker,
});

export async function getBrc20Tokens(
  tickers: string[],
  fiatCurrency: string,
): Promise<CoinsResponse | null> {
  const url = `http://localhost:3001/v1/brc20/tokens`;

  const params = {
    currency: fiatCurrency,
    tickers,
  };

  return axios
    .get<CoinsResponse>(url, { params })
    .then((response) => response.data)
    .catch(() => null);
}

const useBtcCoinBalance = () => {
  const dispatch = useDispatch();
  const { ordinalsAddress, network, brcCoinsList, fiatCurrency } = useWalletSelector();

  // For future lost souls:
  // brcCoinsList = current local store
  // ordinalsFtBalance = latest brc20 balance
  // brc20Tokens = brc20 coin data,
  // WITH additional supported tokens returned even if not passed
  const fetchBrcCoinsBalances = async () => {
    try {
      const ordinalsFtBalance = await getOrdinalsFtBalance(network.type, ordinalsAddress);

      const brc20Tokens = await getBrc20Tokens(
        ordinalsFtBalance.map((o) => o.ticker!),
        fiatCurrency,
      );
      const allKnownTickers = [
        ...ordinalsFtBalance,
        ...(brc20Tokens ?? []),
        ...(brcCoinsList ?? []),
      ]
        .map((x) => x.ticker)
        .filter(
          (ticker, index, array): ticker is string =>
            ticker !== undefined && array.indexOf(ticker) === index,
        );

      const mergedList = allKnownTickers.map((ticker) => {
        const existingToken = brcCoinsList?.find((c) => c.ticker === ticker);
        const newToken = ordinalsFtBalance?.find((o) => o.ticker === ticker);
        const brc20Coin = brc20Tokens?.find((t) => t.ticker === ticker);
        const brc20Ft = brc20Coin && coinToFungibleToken(brc20Coin);
        const tokenFiatRate = brc20Coin?.tokenFiatRate;

        return {
          ...existingToken,
          ...(newToken || brc20Ft),
          tokenFiatRate,
          // The `visible` property from `xverse-core` defaults to true.
          // We override `visible` to ensure that the existing state is preserved.
          ...(existingToken ? { visible: existingToken.visible } : {}),
        };
      }) as FungibleToken[];

      dispatch(setBrcCoinsDataAction(mergedList));
      return mergedList;
    } catch (e: any) {
      return Promise.reject(e);
    }
  };

  return useQuery({
    queryKey: [`btc-coins-balance-${ordinalsAddress}`],
    queryFn: fetchBrcCoinsBalances,
    refetchOnWindowFocus: true,
  });
};

export default useBtcCoinBalance;
