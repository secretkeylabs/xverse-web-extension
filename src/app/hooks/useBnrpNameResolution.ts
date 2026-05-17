import { useState, useCallback } from 'react';

const BNRP_API = 'https://api.bnrp.name/v1';

export const BNRP_TLDS = ['.btc', '.sats', '.x', '.ord', '.xbt', '.gm', '.unisat', '.sat'] as const;

export function isBnrpName(value: string): boolean {
  const lower = value.toLowerCase().trim();
  return BNRP_TLDS.some(tld => lower.endsWith(tld));
}

interface BnrpAddresses {
  btc_taproot: string | null;
  btc_segwit: string | null;
  btc_p2sh: string | null;
  btc_legacy: string | null;
}

interface BnrpResolveResponse {
  name: string;
  addresses: BnrpAddresses;
}

export type BnrpResolutionState =
  | { status: 'idle' }
  | { status: 'resolving' }
  | { status: 'resolved'; address: string; name: string }
  | { status: 'error'; message: string };

export function useBnrpNameResolution() {
  const [resolution, setResolution] = useState<BnrpResolutionState>({ status: 'idle' });

  const resolve = useCallback(async (name: string): Promise<string | null> => {
    if (!isBnrpName(name)) return null;

    setResolution({ status: 'resolving' });
    try {
      const res = await fetch(`${BNRP_API}/resolve/${encodeURIComponent(name.trim())}`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        setResolution({ status: 'error', message: 'Name not found' });
        return null;
      }
      const data: BnrpResolveResponse = await res.json();
      const address =
        data.addresses.btc_taproot ??
        data.addresses.btc_segwit ??
        data.addresses.btc_p2sh ??
        data.addresses.btc_legacy ??
        null;

      if (address) {
        setResolution({ status: 'resolved', address, name: data.name });
        return address;
      } else {
        setResolution({ status: 'error', message: 'No Bitcoin address on record' });
        return null;
      }
    } catch {
      setResolution({ status: 'error', message: 'Resolution failed' });
      return null;
    }
  }, []);

  const reset = useCallback(() => setResolution({ status: 'idle' }), []);

  return { resolution, resolve, reset };
}
