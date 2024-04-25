import useWalletSelector from '@hooks/useWalletSelector';
import {
  NetworkType,
  SupportedCurrency,
  fetchBtcToCurrencyRate,
  fetchStxToBtcRate,
} from '@secretkeylabs/xverse-core';
import { setCoinRatesAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const useGetRates = (fiatCurrency: SupportedCurrency, networkType: NetworkType) => {
  const fetchCoinRates = async () => {
    try {
      const btcFiatRate = await fetchBtcToCurrencyRate(networkType, {
        fiatCurrency,
      });
      const stxBtcRate = await fetchStxToBtcRate(networkType);
      return { stxBtcRate, btcFiatRate };
    } catch (e: any) {
      return Promise.reject(e);
    }
  };

  return useQuery({
    queryKey: ['coin_rates', fiatCurrency, networkType],
    queryFn: fetchCoinRates,
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

export const useCoinRates = () => {
  const dispatch = useDispatch();
  const { fiatCurrency, network } = useWalletSelector();

  const { data } = useGetRates(fiatCurrency, network.type);
  useEffect(() => {
    if (!data?.btcFiatRate || !data?.stxBtcRate) {
      return;
    }
    dispatch(setCoinRatesAction(data.stxBtcRate, data.btcFiatRate));
  }, [data?.btcFiatRate]);
};

export default useCoinRates;
