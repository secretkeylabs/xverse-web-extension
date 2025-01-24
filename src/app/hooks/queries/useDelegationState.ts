import useNetworkSelector from '@hooks/useNetwork';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { fetchDelegationState } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

const useDelegationState = () => {
  const { stxAddress } = useSelectedAccount();
  const selectedNetwork = useNetworkSelector();

  return useQuery({
    queryKey: ['stacking-delegation-state', selectedNetwork, stxAddress],
    queryFn: () => fetchDelegationState(stxAddress, selectedNetwork),
    enabled: Boolean(stxAddress),
  });
};

export default useDelegationState;
