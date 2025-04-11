import useXverseApi from '@hooks/apiClients/useXverseApi';
import useWalletSelector from '@hooks/useWalletSelector';
import { type SupportedCurrency } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

const useGetSip10TokenInfo = ({
  principal,
  fiatCurrency,
}: {
  principal?: string;
  fiatCurrency?: SupportedCurrency;
}) => {
  const { network, fiatCurrency: defaultFiatCurrency } = useWalletSelector();

  const xverseApiClient = useXverseApi();

  const fetchTokensInfo = async () => {
    if (principal) {
      const coinsInfo = await xverseApiClient.getSip10Tokens(
        [principal],
        fiatCurrency ?? defaultFiatCurrency,
      );
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
