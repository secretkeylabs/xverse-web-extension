import { useEffect, useState, type DependencyList } from 'react';

type AsyncEffect = (isEffectActive: () => boolean) => Promise<void>;

type CleanupEffect = () => Promise<void> | void;

const isDependencyList = (arg: any): arg is DependencyList => Array.isArray(arg);

export function useAsyncEffect(asyncEffect: AsyncEffect, deps: DependencyList);
export function useAsyncEffect(
  asyncEffect: AsyncEffect,
  cleanupEffect: CleanupEffect,
  deps: DependencyList,
);
export default function useAsyncEffect(
  asyncEffect: AsyncEffect,
  arg2: CleanupEffect | DependencyList,
  arg3?: DependencyList,
) {
  const [effectError, setEffectError] = useState<Error | undefined>(undefined);
  const arg2IsDependencyList = isDependencyList(arg2);
  const deps = arg2IsDependencyList ? arg2 : arg3;
  const cleanupEffect = arg2IsDependencyList ? undefined : arg2;

  if (effectError) {
    // this will throw the error from the asyncEffect function so that it can be caught by the error boundary
    throw effectError;
  }

  useEffect(() => {
    let isEffectActive = true;

    asyncEffect(() => isEffectActive).catch((error) => {
      if (!isEffectActive) return;

      console.error('Error in async effect:', error);
      setEffectError(error);
    });

    return () => {
      isEffectActive = false;

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
}
