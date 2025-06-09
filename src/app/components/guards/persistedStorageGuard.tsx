import { useHasStoreHydrated } from '@hooks/useHasStoreHydrated';
import type { ReactNode } from 'react';

export function PersistedStorageGuard({ children }: { children: ReactNode }) {
  const hydrated = useHasStoreHydrated();

  if (!hydrated) {
    return null;
  }

  return children;
}
