import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export class InvalidParamsError extends Error {}

export function handleRetries(failureCount: number, error: unknown): boolean {
  if (error instanceof InvalidParamsError) {
    return false;
  }
  return failureCount < 3;
}

export const queryClient = new QueryClient();

export const offlineStorage = createSyncStoragePersister({ storage: window.localStorage });
