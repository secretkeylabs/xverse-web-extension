import useXverseApi from '@hooks/apiClients/useXverseApi';
import useWalletSelector from '@hooks/useWalletSelector';
import type { HistoricalDataParamsPeriod } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import useGetExchangeRate from './useGetExchangeRate';

const useGetHistoricalData = (id: string, period: HistoricalDataParamsPeriod) => {
  const xverseApi = useXverseApi();

  const { fiatCurrency } = useWalletSelector();
  const { data: exchangeRates } = useGetExchangeRate('USD');
  const exchangeRate = exchangeRates ? Number(exchangeRates[fiatCurrency]) : 1;

  return useQuery({
    // eslint-disable-next-line
    queryKey: ['get-historical-data', id, period, fiatCurrency],
    queryFn: () => xverseApi.getHistoricalData(id, period, exchangeRate),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export default useGetHistoricalData;
