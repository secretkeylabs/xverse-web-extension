import useXverseApi from '@hooks/apiClients/useXverseApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export default function useRuneUtxosQueryPerMarketplace(
  rune: FungibleToken,
  backgroundRefetch = true,
) {
  const { network } = useWalletSelector();
  const { ordinalsAddress } = useSelectedAccount();
  const xverseApi = useXverseApi();
  if (network.type !== 'Mainnet') {
    throw new Error('Only available on Mainnet');
  }

  const queryFn = useCallback(async () => {
    const res = await xverseApi.listings.getListedUtxos({
      address: ordinalsAddress,
      rune: {
        name: rune.name,
        id: rune.principal,
      },
    });

    const marketplaces = Object.groupBy(
      res.marketplaces,
      (listingProvider) => listingProvider.name,
    );

    const sortedRes = Object.values(res.utxos)
      .sort((a, b) => {
        const amountA = Number(a.runes?.[0][1].amount);
        const amountB = Number(b.runes?.[0][1].amount);
        return amountB - amountA;
      })
      .map((item) => {
        item.listings = item.listings.map((listing) =>
          Object.assign(listing, { marketplace: marketplaces[listing.marketplaceName]?.[0] }),
        );

        return item;
      });

    const { listedItems, unlistedItems } = Object.groupBy(sortedRes, (item) =>
      item.listings.length ? 'listedItems' : 'unlistedItems',
    );

    return {
      listedItems,
      unlistedItems,
    };
  }, [xverseApi, ordinalsAddress, rune.name, rune.ticker]);

  return useQuery({
    refetchOnWindowFocus: backgroundRefetch,
    refetchOnReconnect: backgroundRefetch,
    queryKey: ['get-listed-rune-utxos', ordinalsAddress, rune.name],
    enabled: Boolean(ordinalsAddress && rune.name),
    queryFn,
  });
}
