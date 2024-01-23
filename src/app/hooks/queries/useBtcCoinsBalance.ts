import useWalletSelector from '@hooks/useWalletSelector';
import { getBrc20Tokens, getOrdinalsFtBalance } from '@secretkeylabs/xverse-core';
import { setBrcCoinsDataAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

const useBtcCoinBalance = () => {
  const dispatch = useDispatch();
  const { ordinalsAddress, network, brcCoinsList, fiatCurrency } = useWalletSelector();

  const fetchBrcCoinsBalances = async () => {
    try {
      const ordinalsFtBalance = await getOrdinalsFtBalance(network.type, ordinalsAddress);
      const brc20Tokens = await getBrc20Tokens(
        ordinalsFtBalance.map((o) => o.ticker!),
        fiatCurrency,
      );

      const mergedList = ordinalsFtBalance.map((newToken) => {
        const existingToken = brcCoinsList?.find((c) => c.ticker === newToken.ticker);
        const tokenFiatRate = brc20Tokens?.find((t) => t.ticker === newToken.ticker)?.tokenFiatRate;

        return {
          ...existingToken,
          ...newToken,
          ...(tokenFiatRate ? { tokenFiatRate } : {}),
          // The `visible` property from `xverse-core` defaults to true.
          // We override `visible` to ensure that the existing state is preserved.
          ...(existingToken ? { visible: existingToken.visible } : {}),
        };
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
