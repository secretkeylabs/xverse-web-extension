import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import onramperApi from './client';
import type { FetchBuyQuotesParams } from './client/types';

interface UseGetBuyQuotesOptions {
  enabled?: boolean;
  onError?: (error: unknown) => void;
}

export const REFETCH_QUOTES_INTERVAL_SECONDS = 30;

const useGetBuyQuotes = (
  params: FetchBuyQuotesParams,
  options: UseGetBuyQuotesOptions = { enabled: true },
) => {
  const { t } = useTranslation('translation', { keyPrefix: 'BUY_SCREEN' });

  const query = useQuery({
    enabled: !!params && options.enabled,
    queryKey: ['get-buy-quotes', params],
    queryFn: () => onramperApi.fetchBuyQuotes(params),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (query.isError) {
      console.error('Error fetching quotes:', query.error);
      toast.error(t('ERRORS.FETCHING_QUOTES'), { duration: 3000 });

      options.onError?.(query.error);
    }
  }, [query.isError, query.error, t, options]);

  return query;
};

export default useGetBuyQuotes;
