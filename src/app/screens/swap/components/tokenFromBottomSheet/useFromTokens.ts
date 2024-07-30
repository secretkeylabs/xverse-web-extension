import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useCoinRates from '@hooks/queries/useCoinRates';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { mapFTProtocolToSwapProtocol } from '@screens/swap/utils';
import {
  getXverseApiClient,
  type FungibleToken,
  type TokenBasic,
} from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { handleRetries } from '@utils/query';
import { sortFtByFiatBalance } from '@utils/tokens';

const useFromTokens = (to?: TokenBasic) => {
  const { network } = useWalletSelector();
  const { acceptableCoinList: sip10FtList } = useStxCurrencyConversion();
  const { unfilteredData: runesFtList } = useRuneFungibleTokensQuery();
  const { stxBtcRate, btcFiatRate } = useCoinRates();
  const { btcAddress } = useSelectedAccount();

  const coinsMasterList = useMemo(
    () => [...sip10FtList, ...(runesFtList || []), btcFt, stxFt] ?? [],
    [sip10FtList, runesFtList],
  );

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

  const queryFn = async () => {
    const response = await getXverseApiClient(network.type).swaps.getSourceTokens({
      to,
      userTokens,
    });

    return response
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
  };

  return useQuery({
    enabled: userTokens.length > 0,
    retry: handleRetries,
    queryKey: ['swap-from-tokens', network.type, to, userTokens],
    queryFn,
  });
};

export default useFromTokens;
