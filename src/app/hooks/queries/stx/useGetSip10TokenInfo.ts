import useWalletSelector from '@hooks/useWalletSelector';
import { getXverseApiClient } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

const useGetSip10TokenInfo = (principal?: string) => {
  const { fiatCurrency, network } = useWalletSelector();

  const xverseApiClient = getXverseApiClient(network.type);

  const fetchTokensInfo = async () => {
    if (principal) {
      const coinsInfo = await xverseApiClient.getCoinsInfo([principal], fiatCurrency);

      const tokenInfo = coinsInfo.find((coin) => coin.contract === principal);
      return tokenInfo;
    }
  };

  const {
    data: tokenInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sip10TokensInfo', principal, fiatCurrency, network.type],
    queryFn: fetchTokensInfo,
    enabled: !!principal,
  });

  return { tokenInfo, isLoading, error };
};

export default useGetSip10TokenInfo;
