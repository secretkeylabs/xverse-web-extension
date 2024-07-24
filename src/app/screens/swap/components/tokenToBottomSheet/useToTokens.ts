import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { mapFTProtocolToSwapProtocol } from '@screens/swap/utils';
import { getXverseApiClient, type Protocol, type TokenBasic } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { handleRetries } from '@utils/query';

const useToTokens = (protocol: Protocol, from?: TokenBasic, query?: string) => {
  const { network } = useWalletSelector();
  const { visible: runesCoinsList } = useVisibleRuneFungibleTokens();
  const { btcAddress } = useSelectedAccount();

  const runesBasicTokens =
    runesCoinsList.map((ft) => ({
      ticker: ft.principal,
      protocol: mapFTProtocolToSwapProtocol(ft.protocol ?? 'runes'),
    })) ?? [];

  const search = query?.trim().replace(/\s+/g, ' ').replace(/ /g, '•') ?? '';
  const btcBasicToken: TokenBasic = { protocol: 'btc', ticker: 'BTC' };
  const userTokens = [...(btcAddress ? [btcBasicToken] : [])].concat(runesBasicTokens);

  const queryFn = async () => {
    const response = await getXverseApiClient(network.type).swaps.getDestinationTokens({
      protocol,
      from,
      search,
      userTokens,
    });

    return response.items.sort((a) => (a.protocol === 'btc' ? -1 : 1));
  };

  return useQuery({
    enabled: userTokens.length > 0,
    retry: handleRetries,
    queryKey: ['swap-from-tokens', network.type, userTokens, protocol, from, search],
    queryFn,
  });
};

export default useToTokens;
