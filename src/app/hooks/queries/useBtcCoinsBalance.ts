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
  // brc20Tokens = brc20 coin metadata,
  // WITH additional supported tokens returned even if not passed
  const fetchBrcCoinsBalances = async () => {
    try {
      // Fetch concurrently to speed things up
      const [ordinalsFtBalance, brc20Tokens] = await Promise.all([
        getOrdinalsFtBalance(network.type, ordinalsAddress),
        getBrc20Tokens(network.type, brcCoinsList?.map((o) => o.ticker!) ?? [], fiatCurrency),
      ]);

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
            ...(tokenFiatRate ? { tokenFiatRate } : {}),
          });
        } else {
          mergedList.push(brc20TokenToFungibleToken(b));
        }
      });

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
