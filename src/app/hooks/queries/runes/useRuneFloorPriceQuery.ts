import useRunesApi from '@hooks/apiClients/useRunesApi';
import useWalletSelector from '@hooks/useWalletSelector';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export default function useRuneFloorPriceQuery(runeName: string, backgroundRefetch = true) {
  const { network } = useWalletSelector();
  if (network.type !== 'Mainnet') {
    throw new Error('Only available on Mainnet');
  }
  const runesApi = useRunesApi();
  const queryFn = useCallback(async () => {
    const res = await runesApi.getRuneMarketData(runeName);
    return Number(res.floorUnitPrice.formatted);
  }, [runeName, runesApi]);
  return useQuery({
    refetchOnWindowFocus: backgroundRefetch,
    refetchOnReconnect: backgroundRefetch,
    queryKey: ['get-rune-floor-price', runeName],
    enabled: Boolean(runeName),
    queryFn,
  });
}
