import useWalletSelector from '@hooks/useWalletSelector';
import {
  getCoinsInfo,
  getXverseApiClient,
  type SupportedCurrency,
} from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

const useGetSip10TokenInfo = ({
  principal,
  fiatCurrency,
}: {
  principal?: string;
  fiatCurrency?: SupportedCurrency;
}) => {
  const { network, fiatCurrency: defaultFiatCurrency } = useWalletSelector();

  const xverseApiClient = getXverseApiClient(network.type);

  const fetchTokensInfo = async () => {
    if (principal) {
      // @ts-ignore
      const coinsInfo = await xverseApiClient.getCoinsInfo(
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
