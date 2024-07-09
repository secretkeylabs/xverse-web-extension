import useSelectedAccount from '@hooks/useSelectedAccount';
import type { StxAddressData } from '@secretkeylabs/xverse-core';
import { fetchStxAddressData } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { PAGINATION_LIMIT } from '@utils/constants';
import useNetworkSelector from '../useNetwork';

const useStxWalletData = () => {
  const { stxAddress } = useSelectedAccount();
  const currentNetworkInstance = useNetworkSelector();
  const fetchStxWalletData = async (): Promise<StxAddressData> =>
    fetchStxAddressData(stxAddress, currentNetworkInstance, 0, PAGINATION_LIMIT);

  return useQuery({
    queryKey: ['stx-wallet-data', stxAddress],
    queryFn: fetchStxWalletData,
    enabled: !!stxAddress,
    staleTime: 10 * 1000, // 10 secs
  });
};

export default useStxWalletData;
