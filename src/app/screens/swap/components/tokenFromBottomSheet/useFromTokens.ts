import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useCoinRates from '@hooks/queries/useCoinRates';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { type FungibleToken } from '@secretkeylabs/xverse-core';
import { sortFtByFiatBalance } from '@utils/tokens';

const useFromTokens = () => {
  const { unfilteredData: runesCoinsList } = useRuneFungibleTokensQuery();
  const { stxBtcRate, btcFiatRate } = useCoinRates();
  const { btcAddress } = useSelectedAccount();

  const tokens: (FungibleToken | 'BTC')[] = (runesCoinsList ?? []).sort((a, b) =>
    sortFtByFiatBalance(a, b, stxBtcRate, btcFiatRate),
  );
  if (btcAddress) tokens.unshift('BTC');

  return tokens;
};

export default useFromTokens;
