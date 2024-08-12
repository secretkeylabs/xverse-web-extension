import useWalletSelector from '@hooks/useWalletSelector';
import {
  fetchBtcToCurrencyRate,
  fetchStxToBtcRate,
  type NetworkType,
  type SupportedCurrency,
} from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

const useGetRates = (fiatCurrency: SupportedCurrency, networkType: NetworkType) => {
  const fetchCoinRates = async () => {
    try {
      const btcFiatRate = await fetchBtcToCurrencyRate(networkType, {
        fiatCurrency,
      });

      const btcUsdRate =
        fiatCurrency === 'USD'
          ? btcFiatRate
          : await fetchBtcToCurrencyRate(networkType, {
              fiatCurrency: 'USD' as SupportedCurrency,
            });

      const stxBtcRate = await fetchStxToBtcRate(networkType);
      return { stxBtcRate, btcFiatRate, btcUsdRate };
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

const useCoinRates = () => {
  const { fiatCurrency, network } = useWalletSelector();

  const { data } = useGetRates(fiatCurrency, network.type);

  const stxBtcRate = data?.stxBtcRate.toString() || '0';
  const btcFiatRate = data?.btcFiatRate.toString() || '0';
  const btcUsdRate = data?.btcUsdRate.toString() || '0';

  return { stxBtcRate, btcFiatRate, btcUsdRate };
};

export default useCoinRates;
