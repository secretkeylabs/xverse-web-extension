import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import { fetchDelegationState } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

const useDelegationState = () => {
  const { stxAddress } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();
  const networkType = selectedNetwork.isMainnet() ? 'Mainnet' : 'Testnet';

  return useQuery({
    queryKey: ['stacking-delegation-state', networkType, stxAddress],
    queryFn: () => fetchDelegationState(stxAddress, selectedNetwork),
    enabled: Boolean(stxAddress),
  });
};

export default useDelegationState;
