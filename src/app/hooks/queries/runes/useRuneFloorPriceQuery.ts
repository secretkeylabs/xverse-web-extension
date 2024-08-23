import useRunesApi from '@hooks/apiClients/useRunesApi';
import useWalletSelector from '@hooks/useWalletSelector';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export default function useRuneFloorPriceQuery(runeName: string, backgroundRefetch = true) {
  const { network } = useWalletSelector();

  const runesApi = useRunesApi();
  const queryFn = useCallback(
    async () =>
      runesApi
        .getRuneMarketData(runeName)
        .then((res) => Number(res.floorUnitPrice?.formatted ?? 0)),
    [runeName, runesApi],
  );
  return useQuery({
    refetchOnWindowFocus: backgroundRefetch,
    refetchOnReconnect: backgroundRefetch,
    queryKey: ['get-rune-floor-price', runeName],
    enabled: Boolean(runeName) && network.type === 'Mainnet',
    queryFn,
  });
}
