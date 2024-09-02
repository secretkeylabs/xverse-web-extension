import useRunesApi from '@hooks/apiClients/useRunesApi';
import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useWalletSelector from '@hooks/useWalletSelector';
import type { RuneBase } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export default function useRuneFiatRateQuery(rune: RuneBase) {
  const { fiatCurrency } = useWalletSelector();
  const { data: runesCoinsList } = useRuneFungibleTokensQuery();
  const runesApi = useRunesApi();
  const queryFn = useCallback(async (): Promise<number> => {
    if (runesCoinsList) {
      const fungibleToken = runesCoinsList.find((coin) => coin.principal === rune.runeId);
      if (fungibleToken && fungibleToken.tokenFiatRate) {
        return fungibleToken.tokenFiatRate;
      }
    }
    const runeFiatRates = await runesApi.getRuneFiatRatesByRuneIds([rune.runeId], fiatCurrency);
    return runeFiatRates[rune.runeId]?.[fiatCurrency] ?? 0;
  }, [runesCoinsList, runesApi, rune.runeId, fiatCurrency]);
  return useQuery({
    queryKey: ['get-rune-fiat-rate', rune.runeId, fiatCurrency],
    enabled: Boolean(rune),
    queryFn,
  });
}
