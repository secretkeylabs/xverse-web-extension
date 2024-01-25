import { useEffect, useState } from 'react';

export const useChromeLocalStorage = <T extends unknown>(key: string, defaultValue?: T) => {
  const [value, setValueState] = useState<T | undefined>(undefined);

  useEffect(() => {
    setValueState(undefined);
    chrome.storage.local.get(key, (result) => {
      const newValue = result[key] === undefined ? defaultValue : result[key];
      setValueState(newValue);
    });
  }, [key]);

  const setValue = (newValue: T) => {
    chrome.storage.local.set({ [key]: newValue });
    setValueState(newValue);
  };

  return [value, setValue] as const;
};

export default useChromeLocalStorage;
