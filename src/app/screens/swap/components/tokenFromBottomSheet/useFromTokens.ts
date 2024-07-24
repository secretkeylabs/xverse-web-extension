import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useCoinRates from '@hooks/queries/useCoinRates';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { mapFTProtocolToSwapProtocol } from '@screens/swap/utils';
import { type FungibleToken, type TokenBasic } from '@secretkeylabs/xverse-core';
import { sortFtByFiatBalance } from '@utils/tokens';

const useFromTokens = () => {
  const { unfilteredData: runesCoinsList } = useRuneFungibleTokensQuery();
  const { stxBtcRate, btcFiatRate } = useCoinRates();
  const { btcAddress } = useSelectedAccount();

  const filteredRunesTokensObject = (runesCoinsList ?? []).reduce((acc, ft) => {
    acc[ft.principal] = ft;
    return acc;
  }, {} as Record<FungibleToken['principal'], FungibleToken>);

  const runesBasicTokens =
    Object.values(filteredRunesTokensObject).map((ft) => ({
      ticker: ft.principal,
      protocol: mapFTProtocolToSwapProtocol(ft.protocol ?? 'runes'),
    })) ?? [];

  const btcBasicToken: TokenBasic = { protocol: 'btc', ticker: 'BTC' };
  const userTokens = [...(btcAddress ? [btcBasicToken] : [])].concat(runesBasicTokens);

  const tokens = userTokens
    .filter((token) => token.protocol === 'btc' || !!filteredRunesTokensObject[token.ticker])
    .map((token) => {
      if (token.protocol === 'btc') {
        return 'BTC';
      }
      if (token.protocol === 'runes') {
        return filteredRunesTokensObject[token.ticker];
      }
      return token;
    })
    .sort((a, b) => {
      if (b === 'BTC') return 1;
      const aFT = a as FungibleToken;
      const bFT = b as FungibleToken;
      return sortFtByFiatBalance(aFT, bFT, stxBtcRate, btcFiatRate);
    });

  return tokens;
};

export default useFromTokens;
