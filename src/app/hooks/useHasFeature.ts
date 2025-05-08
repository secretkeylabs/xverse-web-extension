import { FeatureId } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import useXverseApi from './apiClients/useXverseApi';
import useSelectedAccount from './useSelectedAccount';
import useWalletSelector from './useWalletSelector';

const useAppFeatures = () => {
  const { masterPubKey } = useSelectedAccount();
  const { network } = useWalletSelector();
  const xverseApiClient = useXverseApi();

  return useQuery({
    queryKey: ['appFeatures', network.type, masterPubKey],
    queryFn: () => xverseApiClient.getAppFeatures(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export default function useHasFeature(feature: FeatureId): boolean {
  const { data } = useAppFeatures();
  return data?.[feature]?.enabled ?? false;
}
