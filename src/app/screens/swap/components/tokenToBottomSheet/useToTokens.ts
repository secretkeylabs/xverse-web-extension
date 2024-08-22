import useWalletSelector from '@hooks/useWalletSelector';
import useVisibleMasterCoinsList from '@screens/swap/useVisibleMasterCoinsList';
import { mapFTProtocolToSwapProtocol } from '@screens/swap/utils';
import { getXverseApiClient, type Protocol, type TokenBasic } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { handleRetries } from '@utils/query';

const useToTokens = (protocol: Protocol, from?: TokenBasic, query?: string) => {
  const coinsMasterList = useVisibleMasterCoinsList();
  const { network, spamTokens } = useWalletSelector();
  const spamTokenSet = new Set(spamTokens);

  const userTokens =
    coinsMasterList.map((ft) => ({
      ticker: ft.principal,
      protocol: mapFTProtocolToSwapProtocol(ft),
    })) ?? [];

  const search = query?.trim().replace(/\s+/g, ' ').replace(/ /g, '•') ?? '';

  const queryFn = async () => {
    const response = await getXverseApiClient(network.type).swaps.getDestinationTokens({
      protocol,
      from,
      search,
      userTokens,
    });

    const sortedResponse = response.items.sort((a, b) => {
      if (a.protocol === 'btc') return -1;
      if (b.protocol === 'btc') return 1;
      if (a.protocol === 'stx') return -1;
      if (b.protocol === 'stx') return 1;
      return 0;
    });

    const filteredResponse = from
      ? sortedResponse.filter((s) => s.ticker !== from.ticker)
      : sortedResponse;

    return filteredResponse;
  };

  return useQuery({
    enabled: userTokens.length > 0,
    retry: handleRetries,
    queryKey: ['swap-from-tokens', network.type, userTokens, protocol, from, search],
    queryFn,
    select: (data) => data.filter((rune) => !spamTokenSet.has(rune.ticker)),
  });
};

export default useToTokens;
