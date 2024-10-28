import useXverseApi from '@hooks/apiClients/useXverseApi';
import type { ExchangeRateAvailableCurrencies } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

const useGetExchangeRate = (currency: ExchangeRateAvailableCurrencies) => {
  const xverseApi = useXverseApi();

  const queryFn = async () => {
    const response = await xverseApi.getExchangeRate(currency);
    return response;
  };

  return useQuery({
    queryKey: ['get-exchange-rate', currency],
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn,
  });
};

export default useGetExchangeRate;
