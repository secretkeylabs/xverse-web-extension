import useXverseApi from '@hooks/apiClients/useXverseApi';
import type {
  FungibleTokenProtocol,
  TokenStatsAndInfoResponseType,
} from '@secretkeylabs/xverse-core';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';

export default function useGetCoinStatsAndInfoQuery(
  id?: string,
  protocol?: FungibleTokenProtocol,
  backgroundRefetch = false,
): UseQueryResult<TokenStatsAndInfoResponseType> {
  const xverseApi = useXverseApi();
  const queryFn = useCallback(
    () => (id && protocol ? xverseApi.getTokenStatsAndInfo(id, protocol) : {}),
    [xverseApi, id, protocol],
  );

  return useQuery({
    refetchOnWindowFocus: backgroundRefetch,
    refetchOnReconnect: backgroundRefetch,
    cacheTime: 12 * 60 * 60 * 1000, // 12 hours
    queryKey: ['get-coin-stats-and-info', id, protocol],
    queryFn,
  });
}
