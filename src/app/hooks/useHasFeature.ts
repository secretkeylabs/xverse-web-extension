import { FeatureId, getXverseApiClient } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import useSelectedAccount from './useSelectedAccount';
import useWalletSelector from './useWalletSelector';

const useAppFeatures = () => {
  const { masterPubKey } = useSelectedAccount();
  const { network } = useWalletSelector();

  return useQuery({
    queryKey: ['appFeatures', network.type, masterPubKey],
    queryFn: () => getXverseApiClient(network.type).getAppFeatures(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export default function useHasFeature(feature: FeatureId): boolean {
  const { data } = useAppFeatures();
  return data?.[feature]?.enabled ?? false;
}
