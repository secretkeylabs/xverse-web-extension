import useRunesApi from '@hooks/apiClients/useRunesApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { type FungibleToken, type FungibleTokenWithStates } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { selectWithDerivedState } from '@utils/tokens';

export const fetchRuneBalances =
  (
    runesApi: ReturnType<typeof useRunesApi>,
    ordinalsAddress: string,
    fiatCurrency: string,
  ): (() => Promise<FungibleToken[]>) =>
  async () => {
    const runeBalances: FungibleToken[] = await runesApi.getRuneFungibleTokens(
      ordinalsAddress,
      true,
    );

    if (!Array.isArray(runeBalances) || runeBalances.length === 0) {
      return [];
    }

    const runeIds = runeBalances.map((runeBalanceFt: FungibleToken) => runeBalanceFt.principal);
    try {
      const runeFiatRates = await runesApi.getRuneFiatRatesByRuneIds(runeIds, fiatCurrency);
      return runeBalances.map((runeBalanceFt: FungibleToken) => ({
        ...runeBalanceFt,
        tokenFiatRate: runeFiatRates[runeBalanceFt.principal]?.[fiatCurrency],
      }));
    } catch (error) {
      return runeBalances;
    }
  };

export const useRuneFungibleTokensQuery = (
  select?: (data: FungibleTokenWithStates[]) => any,
  backgroundRefetch = true,
) => {
  const { ordinalsAddress } = useSelectedAccount();
  const { runesManageTokens, network, fiatCurrency, spamTokens, showSpamTokens } =
    useWalletSelector();
  const runesApi = useRunesApi();

  const queryFn = fetchRuneBalances(runesApi, ordinalsAddress, fiatCurrency);

  return useQuery({
    queryKey: ['get-rune-fungible-tokens', network.type, ordinalsAddress, fiatCurrency],
    queryFn,
    enabled: Boolean(network && ordinalsAddress),
    select: selectWithDerivedState({
      manageTokens: runesManageTokens,
      spamTokens,
      showSpamTokens,
      select,
    }),
    refetchOnWindowFocus: !!backgroundRefetch,
    refetchOnReconnect: !!backgroundRefetch,
    keepPreviousData: true,
  });
};

// convenience hook to get only enabled rune fungible tokens
export const useVisibleRuneFungibleTokens = (backgroundRefetch = true) => {
  const selectEnabled = (data: FungibleTokenWithStates[]) => data.filter((ft) => ft.isEnabled);
  return useRuneFungibleTokensQuery(selectEnabled, backgroundRefetch);
};
