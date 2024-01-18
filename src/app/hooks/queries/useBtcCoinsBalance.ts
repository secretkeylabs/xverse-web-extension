import useWalletSelector from '@hooks/useWalletSelector';
import { getOrdinalsFtBalance } from '@secretkeylabs/xverse-core';
import { setBrcCoinsDataAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

const useBtcCoinBalance = () => {
  const dispatch = useDispatch();
  const { ordinalsAddress, network, brcCoinsList } = useWalletSelector();

  const fetchBrcCoinsBalances = async () => {
    try {
      const list = await getOrdinalsFtBalance(network.type, ordinalsAddress);

      const mergedList = list.map((newToken) => {
        const existingToken = brcCoinsList?.find((et) => et.ticker === newToken.ticker);

        return {
          ...newToken,
          // The old code enforces the ticker as upper case in the store, even though it returns the lower case ticker
          // Removing this since BRC-20 tokens do not have contracts, and rely on the case-insensitive ticker as a unique identifier
          // (it's case-sensitive within our code, because it's a string)
          // ticker: newToken.ticker?.toUpperCase(),
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
