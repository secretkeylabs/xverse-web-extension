import useRunesApi from '@hooks/apiClients/useRunesApi';
import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useWalletSelector from '@hooks/useWalletSelector';
import type { FungibleTokenWithStates } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export default function useRuneFiatRateQuery(runeId: string) {
  const { fiatCurrency } = useWalletSelector();
  const { data: runesCoinsList } = useRuneFungibleTokensQuery();
  const runesApi = useRunesApi();
  const queryFn = useCallback(async (): Promise<number> => {
    if (runesCoinsList) {
      const fungibleToken = runesCoinsList.find(
        (coin: FungibleTokenWithStates) => coin.principal === runeId,
      );
      if (fungibleToken && fungibleToken.tokenFiatRate) {
        return fungibleToken.tokenFiatRate;
      }
    }
    const runeFiatRates = await runesApi.getRuneFiatRatesByRuneIds([runeId], fiatCurrency);
    return runeFiatRates[runeId]?.[fiatCurrency] ?? 0;
  }, [runesCoinsList, runesApi, runeId, fiatCurrency]);
  return useQuery({
    queryKey: ['get-rune-fiat-rate', runeId, fiatCurrency],
    enabled: Boolean(runeId),
    queryFn,
  });
}
