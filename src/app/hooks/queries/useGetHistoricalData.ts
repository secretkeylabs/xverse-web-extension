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

  const queryFn = async () => {
    const response = await xverseApi.getHistoricalData(id, period, exchangeRate);
    return response;
  };

  return useQuery({
    queryKey: ['get-historical-data', id, period, fiatCurrency],
    staleTime: 60 * 60 * 1000, // 1 hour
    queryFn,
  });
};

export default useGetHistoricalData;
