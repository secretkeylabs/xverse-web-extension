import useWalletSelector from '@hooks/useWalletSelector';
import { fetchBtcToCurrencyRate, fetchStxToBtcRate } from '@secretkeylabs/xverse-core';
import { setCoinRatesAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

export const useCoinRates = () => {
  const dispatch = useDispatch();
  const { fiatCurrency, network } = useWalletSelector();

  const fetchCoinRates = async () => {
    try {
      const btcFiatRate = await fetchBtcToCurrencyRate(network.type, {
        fiatCurrency,
      });
      const stxBtcRate = await fetchStxToBtcRate(network.type);
      dispatch(setCoinRatesAction(stxBtcRate, btcFiatRate));
      return { stxBtcRate, btcFiatRate };
    } catch (e: any) {
      return Promise.reject(e);
    }
  };

  return useQuery({
    queryKey: ['coin_rates'],
    queryFn: fetchCoinRates,
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

export default useCoinRates;
