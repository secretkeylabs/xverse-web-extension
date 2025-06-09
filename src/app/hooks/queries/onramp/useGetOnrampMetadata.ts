import { useQuery } from '@tanstack/react-query';

import onramperApi from './client';

const useGetOnrampMetadata = () =>
  useQuery({
    queryKey: ['get-onramp-metadata'],
    queryFn: onramperApi.fetchOnrampMetadata,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

export default useGetOnrampMetadata;
