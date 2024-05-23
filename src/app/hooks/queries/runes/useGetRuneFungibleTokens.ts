import useHasFeature from '@hooks/useHasFeature';
import useRunesApi from '@hooks/useRunesApi';
import useWalletSelector from '@hooks/useWalletSelector';
import { FungibleToken, getXverseApiClient, NetworkType } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const fetchRuneBalances =
  (
    runesApi: ReturnType<typeof useRunesApi>,
    network: NetworkType,
    ordinalsAddress: string,
    fiatCurrency: string,
  ): (() => Promise<FungibleToken[]>) =>
  async () => {
    const runeBalances = await runesApi.getRuneFungibleTokens(ordinalsAddress, true);

    if (!Array.isArray(runeBalances) || runeBalances.length === 0) {
      return [];
    }

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
  const { ordinalsAddress, network, fiatCurrency, spamTokens, showSpamTokens } =
    useWalletSelector();
  const showRunes = useHasFeature('RUNES_SUPPORT');
  const runesApi = useRunesApi();
  const queryFn = fetchRuneBalances(runesApi, network.type, ordinalsAddress, fiatCurrency);
  const query = useQuery({
    queryKey: ['get-rune-fungible-tokens', network.type, ordinalsAddress, fiatCurrency],
    enabled: Boolean(network && ordinalsAddress && showRunes),
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
