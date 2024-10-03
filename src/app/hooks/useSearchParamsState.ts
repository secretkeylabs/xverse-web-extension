import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const useSearchParamsState = <T>(key: string, defaultValue: T): [T, (newValue: T) => void] => {
  const [searchParams, setSearchParamsInternal] = useSearchParams();
  const setSearchParam = (newValue: T) => {
    searchParams.set(key, JSON.stringify(newValue));
    setSearchParamsInternal(searchParams);
  };

  const paramValue = searchParams.get(key);
  const initialValue = paramValue !== null ? (JSON.parse(paramValue) as T) : defaultValue;

  const [value, setValue] = useState<T>(initialValue);
  const customSetter = (newValue: T) => {
    setValue(newValue);
    setSearchParam(newValue);
  };

  useEffect(() => {
    setSearchParam(initialValue);
  }, []);

  return [value, customSetter];
};

export default useSearchParamsState;
