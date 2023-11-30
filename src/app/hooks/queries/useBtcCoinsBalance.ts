import useWalletSelector from '@hooks/useWalletSelector';
import { getOrdinalsFtBalance } from '@secretkeylabs/xverse-core';
import { setBrcCoinsDataAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

const useBtcCoinBalance = () => {
  const dispatch = useDispatch();
  const { ordinalsAddress, network } = useWalletSelector();

  const fetchBrcCoinsBalances = async () => {
    try {
      const list = await getOrdinalsFtBalance(network.type, ordinalsAddress);
      dispatch(
        setBrcCoinsDataAction(
          list.map((brcToken) => ({ ...brcToken, ticker: brcToken.ticker?.toUpperCase() })),
        ),
      );
      return list;
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
