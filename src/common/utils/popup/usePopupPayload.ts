import { useEffect, useState } from 'react';
import { getPopupPayload, type Context } from './index';

type State<TData> =
  | { status: 'loading' }
  | { status: 'error'; error: { name: string; message: string; data?: unknown } }
  | { status: 'ready'; context: Context; data: TData };

/**
 * React helper for async {@linkcode getPopupPayload}.
 */
export function usePopupPayload<TData>(dataParser: (data: any) => TData): State<TData> {
  const [state, setState] = useState<State<TData>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    getPopupPayload(dataParser).then((result) => {
      if (cancelled) return;
      const [err, payload] = result;
      if (err) {
        setState({ status: 'error', error: err });
        return;
      }
      setState({ status: 'ready', context: payload.context, data: payload.data });
    });

    return () => {
      cancelled = true;
    };
    // Parser identity is stable for valibot parsers; intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
