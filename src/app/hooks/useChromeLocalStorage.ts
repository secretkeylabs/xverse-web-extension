import { chromeLocalStorage } from '@utils/chromeStorage';
import { useEffect, useState } from 'react';

export const useChromeLocalStorage = <T extends unknown>(key: string, defaultValue?: T) => {
  const [value, setValueState] = useState<T | undefined>(undefined);

  useEffect(() => {
    setValueState(undefined);
    chromeLocalStorage.getItem<T>(key).then((result) => {
      const newValue = result === undefined ? defaultValue : result;
      setValueState(newValue);
    });
  }, [key]);

  const setValue = (newValue: T) => {
    chromeLocalStorage.setItem(key, newValue);
    setValueState(newValue);
  };

  return [value, setValue] as const;
};

export default useChromeLocalStorage;
