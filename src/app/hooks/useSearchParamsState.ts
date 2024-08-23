import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const useSearchParamsState = <T>(key: string, defaultValue: T): [T, (newValue: T) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const paramValue = searchParams.get(key);
  const initialValue = paramValue !== null ? (JSON.parse(paramValue) as T) : defaultValue;

  const [value, setValue] = useState<T>(initialValue);
  const customSetter = (newValue: T) => {
    setValue(newValue);
    searchParams.set(key, JSON.stringify(newValue));
    setSearchParams(searchParams);
  };

  return [value, customSetter];
};

export default useSearchParamsState;
