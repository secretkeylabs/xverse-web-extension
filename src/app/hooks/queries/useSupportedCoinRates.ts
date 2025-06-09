import useXverseApi from '@hooks/apiClients/useXverseApi';
import useWalletSelector from '@hooks/useWalletSelector';
import { type SupportedCurrency } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

const useGetSupportedRates = (fiatCurrency: SupportedCurrency) => {
  const xverseApi = useXverseApi();
  const fetchCoinRates = async () => {
    try {
      const btcFiatRate = await xverseApi.fetchBtcToCurrencyRate({
        fiatCurrency,
      });
      const btcUsdRate =
        fiatCurrency === 'USD'
          ? btcFiatRate
          : await xverseApi.fetchBtcToCurrencyRate({
              fiatCurrency: 'USD' as SupportedCurrency,
            });
      const stxBtcRate = await xverseApi.fetchStxToBtcRate();
      return { stxBtcRate, btcFiatRate, btcUsdRate };
    } catch (e: any) {
      return Promise.reject(e);
    }
  };

  return useQuery({
    queryKey: ['coin_rates', fiatCurrency],
    queryFn: fetchCoinRates,
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

const useSupportedCoinRates = (overrideFiatCurrency?: SupportedCurrency) => {
  // If an override is provided, use it. Otherwise, fall back to the wallet selector.
  const { fiatCurrency: walletFiatCurrency } = useWalletSelector();
  const fiatCurrency = overrideFiatCurrency || walletFiatCurrency;
  const { data } = useGetSupportedRates(fiatCurrency);
  const stxBtcRate = data?.stxBtcRate.toString() || '0';
  const btcFiatRate = data?.btcFiatRate.toString() || '0';
  const btcUsdRate = data?.btcUsdRate?.toString() || '0';

  return { stxBtcRate, btcFiatRate, btcUsdRate };
};

export default useSupportedCoinRates;
