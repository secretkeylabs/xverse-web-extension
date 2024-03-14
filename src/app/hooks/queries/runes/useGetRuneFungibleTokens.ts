import useHasFeature from '@hooks/useHasFeature';
import useRunesApi from '@hooks/useRunesApi';
import useWalletSelector from '@hooks/useWalletSelector';
import { FungibleToken } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

export const useGetRuneFungibleTokens = () => {
  const { ordinalsAddress, network } = useWalletSelector();
  const showRunes = useHasFeature('RUNES_SUPPORT');
  const RunesApi = useRunesApi();
  return useQuery({
    queryKey: ['get-rune-fungible-tokens', network.type, ordinalsAddress],
    // TODO: remove showRunes once available in mainnet as well
    enabled: Boolean(network && ordinalsAddress && showRunes),
    queryFn: async () => RunesApi.getRuneFungibleTokens(ordinalsAddress),
  });
};

/*
 * This hook is used to get the list of runes which the user has not hidden
 */
export const useVisibleRuneFungibleTokens = (): ReturnType<typeof useGetRuneFungibleTokens> & {
  visible: FungibleToken[];
} => {
  const { runesManageTokens } = useWalletSelector();
  const runesQuery = useGetRuneFungibleTokens();
  return {
    ...runesQuery,
    visible: (runesQuery.data ?? []).filter((rune) => runesManageTokens[rune.principal] !== false),
  };
};
