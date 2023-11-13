import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';

export class InvalidParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidParamsError';
  }
}

export function handleRetries(failureCount: number, error: unknown): boolean {
  if (error instanceof InvalidParamsError) {
    return false;
  }
  return failureCount < 3;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // time before garbage collection of query data
      cacheTime: 5 * 60 * 1000, // 5 min

      // increase this for specific queries to reduce refetches
      staleTime: 0,

      // at least one of these are required to refetch stale queries
      // refetchInterval
      // refetchIntervalInBackground
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

export const offlineStorage = createSyncStoragePersister({ storage: window.localStorage });
