import { useEffect, useState } from 'react';

export default function useDebounce(value: string, delay: number, immediate = false) {
  const [debouncedValue, setDebouncedValue] = useState(immediate ? value : '');

  useEffect(() => {
    if (immediate && debouncedValue === '') {
      setDebouncedValue(value);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, immediate, debouncedValue]);

  return debouncedValue;
}
