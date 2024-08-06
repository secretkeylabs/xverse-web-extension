import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useCoinRates from '@hooks/queries/useCoinRates';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { type FungibleToken, type Token } from '@secretkeylabs/xverse-core';
import { sortFtByFiatBalance } from '@utils/tokens';

const useFromTokens = (toToken?: Token) => {
  const { unfilteredData: runesCoinsList } = useRuneFungibleTokensQuery();
  const { stxBtcRate, btcFiatRate } = useCoinRates();
  const { btcAddress } = useSelectedAccount();

  // Create a copy of the tokens array to avoid global changes
  const tokens: (FungibleToken | 'BTC')[] = [...(runesCoinsList ?? [])].sort((a, b) =>
    sortFtByFiatBalance(a, b, stxBtcRate, btcFiatRate),
  );

  if (btcAddress && toToken?.protocol !== 'btc') tokens.unshift('BTC');

  const filteredTokens = toToken
    ? tokens.filter((token) => token === 'BTC' || token.principal !== toToken.ticker)
    : tokens;

  return filteredTokens;
};

export default useFromTokens;
