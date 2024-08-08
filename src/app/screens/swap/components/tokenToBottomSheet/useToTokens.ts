import useWalletSelector from '@hooks/useWalletSelector';
import useVisibleMasterCoinsList from '@screens/swap/useVisibleMasterCoinsList';
import { mapFTProtocolToSwapProtocol } from '@screens/swap/utils';
import { getXverseApiClient, type Protocol, type TokenBasic } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { handleRetries } from '@utils/query';

const useToTokens = (protocol: Protocol, from?: TokenBasic, query?: string) => {
  const { network } = useWalletSelector();
  const coinsMasterList = useVisibleMasterCoinsList();

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

    const sortedResponse = response.items.sort((a) => (a.protocol === 'btc' ? -1 : 1));

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
  });
};

export default useToTokens;
