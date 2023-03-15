import useWalletSelector from '@hooks/useWalletSelector';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { setCoinRatesAction } from '@stores/wallet/actions/actionCreators';
import { fetchBtcToCurrencyRate, fetchStxToBtcRate } from '@secretkeylabs/xverse-core/api';

export const useCoinRates = () => {
  const dispatch = useDispatch();
  const {
    fiatCurrency,
  } = useWalletSelector();

  const fetchCoinRates = async () => {
    try {
      const btcFiatRate = await fetchBtcToCurrencyRate({
        fiatCurrency,
      });
      const stxBtcRate = await fetchStxToBtcRate();
      dispatch(setCoinRatesAction(stxBtcRate, btcFiatRate));
      return { stxBtcRate, btcFiatRate };
    } catch (e: any) {
      return Promise.reject(e);
    }
  };

  return useQuery({
    queryKey: ['coin_rates'],
    queryFn: fetchCoinRates,
  });
};

export default useCoinRates;
