import useXverseApi from '@hooks/apiClients/useXverseApi';
import useWalletSelector from '@hooks/useWalletSelector';
import type { Marketplace, TokenId } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export default function useRuneFloorPricePerMarketplaceQuery(
  token: TokenId,
  marketplaces: Marketplace[],
  backgroundRefetch = true,
) {
  const { network } = useWalletSelector();
  const xverseApi = useXverseApi();

  const queryFn = useCallback(
    () =>
      xverseApi.listings.getRuneMarketData(token, marketplaces).then((res) =>
        res
          .filter((data) => marketplaces.includes(data.marketplace.name))
          .sort((a, b) => (a.marketplace.name < b.marketplace.name ? -1 : 1))
          .map((data) => ({
            floorPrice: Number(data.floorPrice ?? '0'),
            marketplace: data.marketplace,
          })),
      ),
    [token, marketplaces, xverseApi],
  );

  return useQuery({
    refetchOnWindowFocus: backgroundRefetch,
    refetchOnReconnect: backgroundRefetch,
    queryKey: ['get-rune-floor-price-per-marketplace', token],
    enabled: Boolean(Object.keys(token).length) && network.type === 'Mainnet',
    queryFn,
  });
}
