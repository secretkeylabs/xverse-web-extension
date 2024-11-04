import { useCallback, useMemo, useState } from 'react';

const tryParse = <T>(val: string | null | undefined, defaultValue?: T) => {
  if (!val) return defaultValue;
  try {
    return JSON.parse(val) as T;
  } catch (e) {
    return defaultValue;
  }
};

const useStorage = <T>(storageType: 'local' | 'session', key: string, defaultValue?: T) => {
  const lookupKey = `useStorage:${key}`;

  const storage = useMemo(() => {
    if (storageType === 'local') return localStorage;
    return sessionStorage;
  }, [storageType]);

  const [value, setValue] = useState(tryParse<T>(storage.getItem(lookupKey), defaultValue));

  const set = useCallback(
    (newValue: T | undefined) => {
      if (newValue === undefined) {
        storage.removeItem(lookupKey);
        setValue(undefined);
      } else {
        storage.setItem(lookupKey, JSON.stringify(newValue));
        setValue(newValue);
      }
    },
    [lookupKey, storage],
  );

  return [value, set] as const;
};

// !NOTE: add localStorage if needed. Knip fails if it's added and unused.
export function useSessionStorage<T>(
  key: string,
): [T | undefined, (newValue: T | undefined) => void];
export function useSessionStorage<T>(key: string, defaultValue: T): [T, (newValue: T) => void];
export function useSessionStorage<T>(key: string, defaultValue?: T) {
  return useStorage('session', key, defaultValue);
}
