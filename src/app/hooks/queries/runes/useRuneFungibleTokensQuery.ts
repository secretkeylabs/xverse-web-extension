import useHasFeature from '@hooks/useHasFeature';
import useRunesApi from '@hooks/useRunesApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { FungibleToken } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const fetchRuneBalances =
  (
    runesApi: ReturnType<typeof useRunesApi>,
    ordinalsAddress: string,
    fiatCurrency: string,
  ): (() => Promise<FungibleToken[]>) =>
  async () => {
    const runeBalances = await runesApi.getRuneFungibleTokens(ordinalsAddress, true);

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

export const useRuneFungibleTokensQuery = (backgroundRefetch = true) => {
  const { ordinalsAddress } = useSelectedAccount();
  const { network, fiatCurrency, spamTokens, showSpamTokens } = useWalletSelector();
  const showRunes = useHasFeature('RUNES_SUPPORT');
  const runesApi = useRunesApi();
  const queryFn = fetchRuneBalances(runesApi, ordinalsAddress, fiatCurrency);
  const query = useQuery({
    queryKey: ['get-rune-fungible-tokens', network.type, ordinalsAddress, fiatCurrency],
    enabled: Boolean(network && ordinalsAddress && showRunes),
    refetchOnWindowFocus: backgroundRefetch,
    refetchOnReconnect: backgroundRefetch,
    queryFn,
  });

  return {
    ...query,
    unfilteredData: query.data,
    data: query.data?.filter((ft) => {
      let passedSpamCheck = true;
      if (spamTokens?.length) {
        passedSpamCheck = showSpamTokens || !spamTokens.includes(ft.principal);
      }
      return passedSpamCheck;
    }),
  };
};

/*
 * This hook is used to get the list of runes which the user has not hidden
 */
export const useVisibleRuneFungibleTokens = (
  backgroundRefetch = true,
): ReturnType<typeof useRuneFungibleTokensQuery> & {
  visible: FungibleToken[];
} => {
  const { runesManageTokens } = useWalletSelector();
  const runesQuery = useRuneFungibleTokensQuery(backgroundRefetch);
  return {
    ...runesQuery,
    visible: (runesQuery.data ?? []).filter((ft) => {
      const userSetting = runesManageTokens[ft.principal];
      return userSetting === true || (userSetting === undefined && new BigNumber(ft.balance).gt(0));
    }),
  };
};
