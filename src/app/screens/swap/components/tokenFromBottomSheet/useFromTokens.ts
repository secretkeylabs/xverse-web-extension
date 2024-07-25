import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useCoinRates from '@hooks/queries/useCoinRates';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { type FungibleToken } from '@secretkeylabs/xverse-core';
import { sortFtByFiatBalance } from '@utils/tokens';

const useFromTokens = () => {
  const { unfilteredData: runesCoinsList } = useRuneFungibleTokensQuery();
  const { stxBtcRate, btcFiatRate } = useCoinRates();
  const { btcAddress } = useSelectedAccount();

  const filteredRunesTokensObject = (runesCoinsList ?? []).reduce((acc, ft) => {
    acc[ft.principal] = ft;
    return acc;
  }, {} as Record<FungibleToken['principal'], FungibleToken>);

  const tokens: (FungibleToken | 'BTC')[] = [...Object.values(filteredRunesTokensObject)].sort(
    (a, b) => {
      const aFT = a;
      const bFT = b;
      return sortFtByFiatBalance(aFT, bFT, stxBtcRate, btcFiatRate);
    },
  );

  if (btcAddress) tokens.unshift('BTC');

  return tokens;
};

export default useFromTokens;
