import type { StoreMutators, StoreName, StoreSchema, StoreUtils } from '@secretkeylabs/xverse-core';
import { shallowCompare } from '@secretkeylabs/xverse-core';
import { globalStoreManager } from '@stores/persistentStoreManager';
import { useEffect, useMemo, useState } from 'react';

type UseStoreReturn<T extends StoreName, S> = {
  data: S;
  actions: StoreMutators<T>;
  utils: StoreUtils<T>;
};

export const useStore = <T extends StoreName, S = StoreSchema<T>>(
  store: T,
  selector: (store: StoreSchema<T>, utils: StoreUtils<T>) => S = (storeData: StoreSchema<T>) =>
    storeData as S,
): UseStoreReturn<T, S> => {
  const actions = useMemo(() => globalStoreManager.getStoreMutators(store), [store]);
  const utils = useMemo(() => globalStoreManager.getStoreUtils(store), [store]);

  const [dataLocal, setDataLocal] = useState<S>(() =>
    selector(globalStoreManager.getStoreValue(store), utils),
  );

  useEffect(() => {
    let isMounted = true;

    const changeHandler = async (newValue: StoreSchema<T>) => {
      if (!isMounted) return;
      const newData = selector(newValue, utils);
      setDataLocal((oldData) => {
        if (shallowCompare(oldData, newData)) {
          return oldData;
        }
        return newData;
      });
    };

    const removeListener = globalStoreManager.addListener(store, changeHandler);

    return () => {
      isMounted = false;
      removeListener();
    };
  }, [selector, utils, store]);

  return { data: dataLocal, actions, utils };
};
