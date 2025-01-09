import { useEffect, type DependencyList } from 'react';

type EffectCallback = (isEffectActive: () => boolean) => Promise<void> | void;

export default function useCancellableEffect(effectFn: EffectCallback, deps: DependencyList) {
  useEffect(() => {
    let isEffectActive = true;

    const wrappedEffect = async () => {
      await effectFn(() => isEffectActive);
    };

    wrappedEffect();

    return () => {
      isEffectActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
