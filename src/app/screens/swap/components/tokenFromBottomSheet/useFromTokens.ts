import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useMasterCoinsList from '@screens/swap/useMasterCoinsList';
import { mapSwapProtocolToFTProtocol } from '@screens/swap/utils';
import { type Token } from '@secretkeylabs/xverse-core';
import { sortFtByFiatBalance } from '@utils/tokens';

const useFromTokens = (toToken?: Token) => {
  const tokens = useMasterCoinsList();
  const { stxBtcRate, btcFiatRate } = useSupportedCoinRates();

  // Sort tokens, keeping BTC as the first element, and STX (if enabled) as the second
  const sortedTokens = tokens.sort((a, b) => {
    if (a.principal === 'BTC') return -1;
    if (b.principal === 'BTC') return 1;
    if (a.principal === 'STX') return -1;
    if (b.principal === 'STX') return 1;
    return sortFtByFiatBalance(a, b, stxBtcRate, btcFiatRate);
  });

  const filteredTokens = toToken
    ? sortedTokens.filter(
        (token) =>
          token.principal !== toToken.ticker &&
          mapSwapProtocolToFTProtocol(toToken.protocol) === token.protocol,
      )
    : sortedTokens;

  return filteredTokens;
};

export default useFromTokens;
