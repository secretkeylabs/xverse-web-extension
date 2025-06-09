import { useQuery } from '@tanstack/react-query';

import onramperApi from './client';

const useGetDefaults = () =>
  useQuery({
    queryKey: ['get-defaults'],
    queryFn: onramperApi.fetchDefaults,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

export default useGetDefaults;
