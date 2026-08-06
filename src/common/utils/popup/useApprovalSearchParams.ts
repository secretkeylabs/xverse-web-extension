import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getLegacyApprovalParams, resolveRequestIdFromLocation } from './index';

type State =
  | { status: 'loading'; params: URLSearchParams }
  | { status: 'ready'; params: URLSearchParams }
  | { status: 'error'; params: URLSearchParams; error: string };

/**
 * Resolve approval-popup search params.
 *
 * Modern flow: opaque `requestId` → SW approval store (secrets not in the URL).
 * Legacy fallback: params still embedded in the hash query (in-flight popups).
 */
export function useApprovalSearchParams(): State {
  const { search } = useLocation();
  const [state, setState] = useState<State>({
    status: 'loading',
    params: new URLSearchParams(),
  });

  useEffect(() => {
    let cancelled = false;
    const urlParams = new URLSearchParams(search);
    const requestId =
      urlParams.get('requestId') ?? resolveRequestIdFromLocation();

    (async () => {
      if (requestId) {
        const [err, legacyParams] = await getLegacyApprovalParams();
        if (cancelled) return;
        if (err || !legacyParams) {
          setState({
            status: 'error',
            params: new URLSearchParams(),
            error: err?.message ?? 'Approval request not found or expired',
          });
          return;
        }
        setState({
          status: 'ready',
          params: new URLSearchParams(legacyParams),
        });
        return;
      }

      // True legacy: full payload still in the hash query.
      setState({ status: 'ready', params: urlParams });
    })();

    return () => {
      cancelled = true;
    };
  }, [search]);

  return state;
}
