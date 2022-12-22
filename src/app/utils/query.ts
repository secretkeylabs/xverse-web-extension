import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const queryClient = new QueryClient();

export const offlineStorage = createSyncStoragePersister({ storage: window.localStorage });
