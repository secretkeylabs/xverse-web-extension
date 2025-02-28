import { useEffect, useState, type DependencyList } from 'react';

type AsyncEffect<T> = (options: { signal: AbortSignal }) => Promise<T>;

type CleanupEffect = () => Promise<void> | void;

export default function useAsyncFn<T>(
  asyncEffect: AsyncEffect<T>,
  deps: DependencyList,
  cleanupEffect?: CleanupEffect,
) {
  const [data, setData] = useState<T | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [effectError, setEffectError] = useState<Error | undefined>(undefined);

  if (effectError) {
    // this will throw the error from the asyncEffect function so that it can be caught by the error boundary
    throw effectError;
  }

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    setIsLoading(true);
    asyncEffect({ signal })
      .then((result) => {
        if (signal.aborted) return;
        setData(result);
      })
      .catch((error) => {
        if (signal.aborted) return;

        console.error('Error in async effect:', error);
        setEffectError(error);
      })
      .finally(() => {
        if (signal.aborted) return;

        setIsLoading(false);
      });

    return () => {
      abortController.abort();

      if (cleanupEffect) {
        new Promise((resolve, reject) => {
          try {
            resolve(cleanupEffect());
          } catch (error) {
            reject(error);
          }
        }).catch((error) => {
          console.error('Error in cleanup effect:', error);
          setEffectError(error);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, isLoading };
}
