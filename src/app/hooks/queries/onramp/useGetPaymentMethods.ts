import { useQuery } from '@tanstack/react-query';

import onramperApi from './client';

const useGetPaymentMethods = (params: { source: string; target: string }) =>
  useQuery({
    enabled: !!params.source && !!params.target,
    queryKey: ['get-payment-methods', params.source, params.target],
    queryFn: () => onramperApi.fetchPaymentMethods(params.source, params.target),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

export default useGetPaymentMethods;
