import chromeStorage from '@utils/chromeStorage';
import { useEffect, useState } from 'react';

const useChromeLocalStorage = <T extends unknown>(key: string, defaultValue?: T) => {
  const [value, setValueState] = useState<T | undefined>(undefined);

  useEffect(() => {
    setValueState(undefined);
    chromeStorage.local.getItem<T>(key).then((result) => {
      const newValue = result === undefined ? defaultValue : result;
      setValueState(newValue);
    });
  }, [key]);

  const setValue = (newValue: T) => {
    chromeStorage.local.setItem(key, newValue);
    setValueState(newValue);
  };

  return [value, setValue] as const;
};

export default useChromeLocalStorage;
