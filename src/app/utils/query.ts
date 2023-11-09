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

export const queryClient = new QueryClient();

export const offlineStorage = createSyncStoragePersister({ storage: window.localStorage });
