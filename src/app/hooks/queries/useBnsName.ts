import { fetchAddressOfBnsName, getBnsName, validateStxAddress } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import useNetworkSelector from '../useNetwork';
import useWalletSelector from '../useWalletSelector';

type UseBnsNameOptions = {
  enabled?: boolean;
};

export const useBnsName = (walletAddress: string, options: UseBnsNameOptions = {}) => {
  const network = useNetworkSelector();

  return useQuery({
    queryKey: ['bns-name', walletAddress, network],
    queryFn: async () => {
      if (!walletAddress) return '';
      const name = await getBnsName(walletAddress, network);
      return name ?? '';
    },
    enabled: !!walletAddress && options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

type UseBnsResolverOptions = {
  enabled?: boolean;
};

export const useBnsResolver = (
  recipientAddress: string,
  walletAddress: string,
  currencyType?: string,
  options: UseBnsResolverOptions = {},
) => {
  const { network } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();

  return useQuery({
    queryKey: [
      'bns-resolver',
      recipientAddress,
      network,
      currencyType,
      selectedNetwork,
      walletAddress,
    ],
    queryFn: async () => {
      if (currencyType === 'BTC') return '';

      if (!validateStxAddress({ stxAddress: recipientAddress, network: network.type })) {
        const address = await fetchAddressOfBnsName(
          recipientAddress.toLocaleLowerCase(),
          selectedNetwork,
        );
        return address ?? '';
      }

      return '';
    },
    enabled: !!recipientAddress && options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
