import useHasFeature from '@hooks/useHasFeature';
import useRunesApi from '@hooks/useRunesApi';
import useWalletSelector from '@hooks/useWalletSelector';
import { FungibleToken, getXverseApiClient, NetworkType } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const fetchRuneBalances =
  (
    runesApi,
    network: NetworkType,
    ordinalsAddress: string,
    fiatCurrency: string,
  ): (() => Promise<FungibleToken[]>) =>
  async () => {
    const runeBalances = await runesApi.getRuneFungibleTokens(ordinalsAddress);
    const runeNames = runeBalances.map((runeBalanceFt: FungibleToken) => runeBalanceFt.name);
    return getXverseApiClient(network)
      .getRuneFiatRates(runeNames, fiatCurrency)
      .then((runeFiatRates) =>
        runeBalances.map((runeBalanceFt: FungibleToken) => ({
          ...runeBalanceFt,
          tokenFiatRate: runeFiatRates[runeBalanceFt.name]?.[fiatCurrency],
        })),
      )
      .catch(() => runeBalances);
  };

export const useGetRuneFungibleTokens = () => {
  const { ordinalsAddress, network, fiatCurrency } = useWalletSelector();
  const showRunes = useHasFeature('RUNES_SUPPORT');
  const runesApi = useRunesApi();
  const queryFn = fetchRuneBalances(runesApi, network.type, ordinalsAddress, fiatCurrency);
  return useQuery({
    queryKey: ['get-rune-fungible-tokens', network.type, ordinalsAddress, fiatCurrency],
    enabled: Boolean(network && ordinalsAddress && showRunes),
    queryFn,
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
    visible: (runesQuery.data ?? []).filter((ft) => {
      const userSetting = runesManageTokens[ft.principal];
      return userSetting === true || (userSetting === undefined && new BigNumber(ft.balance).gt(0));
    }),
  };
};
