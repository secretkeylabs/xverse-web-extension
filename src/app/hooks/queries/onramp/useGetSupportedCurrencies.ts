import { useQuery } from '@tanstack/react-query';

import onramperApi from './client';

const useGetSupportedCurrencies = () =>
  useQuery({
    queryKey: ['get-supported-currencies'],
    queryFn: onramperApi.fetchSupportedCurrencies,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

export default useGetSupportedCurrencies;
