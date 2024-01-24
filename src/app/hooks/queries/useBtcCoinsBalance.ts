import useWalletSelector from '@hooks/useWalletSelector';
import {
  Brc20Token,
  FungibleToken,
  getBrc20Tokens,
  getOrdinalsFtBalance,
} from '@secretkeylabs/xverse-core';
import { setBrcCoinsDataAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

const brc20TokenToFungibleToken = (coin: Brc20Token): FungibleToken => ({
  name: coin.name,
  principal: coin.ticker ?? coin.name,
  balance: '0',
  total_sent: '',
  total_received: '',
  assetName: coin.name ?? coin.ticker,
  visible: false,
  ticker: coin.ticker,
});

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
      // Fetch concurrently to speed things up
      const [ordinalsFtBalance, brc20Tokens] = await Promise.all([
        getOrdinalsFtBalance(network.type, ordinalsAddress),
        getBrc20Tokens(network.type, brcCoinsList?.map((o) => o.ticker!) ?? [], fiatCurrency),
      ]);

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

      const mergedList = allKnownTickers.reduce((acc, ticker) => {
        const existingToken = brcCoinsList?.find((c) => c.ticker === ticker);
        const newToken = ordinalsFtBalance?.find((o) => o.ticker === ticker);
        const brc20Coin = brc20Tokens?.find((t) => t.ticker === ticker);
        const brc20Ft = brc20Coin && brc20TokenToFungibleToken(brc20Coin);
        const tokenFiatRate = Number(brc20Coin?.tokenFiatRate);

        if (!existingToken && !newToken && !brc20Ft) {
          // Skip over the ticker as none of the tokens exist
          return acc;
        }

        const reconstitutedFt = {
          ...existingToken,
          ...(newToken || brc20Ft),
          ...(tokenFiatRate ? { tokenFiatRate } : {}),
          // The `visible` property from `xverse-core` defaults to true.
          // We override `visible` to ensure that the existing state is preserved.
          ...(existingToken ? { visible: existingToken.visible } : {}),
          // One of the 3 FungibleTokens (existingToken / newToken / brc20Ft)
          // is GUARANTEED to be properly formed, otherwise the element is skipped.
          // However, TypeScript fails to infer this.
          // As such, we can safely assert the type here:
        } as FungibleToken;

        acc.push(reconstitutedFt);

        return acc;
      }, [] as FungibleToken[]);

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
