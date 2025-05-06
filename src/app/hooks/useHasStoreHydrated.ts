import { globalStoreManager } from '@stores/persistentStoreManager';
import { useState } from 'react';
import useAsyncFn from './useAsyncFn';

export const useHasStoreHydrated = (): boolean => {
  const [hasHydrated, setHasHydrated] = useState(false);

  useAsyncFn(async ({ signal }) => {
    await globalStoreManager.waitForInit();
    if (signal.aborted) return;
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};
