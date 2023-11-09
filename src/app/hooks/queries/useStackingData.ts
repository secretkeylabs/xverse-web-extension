import {
  fetchDelegationState,
  fetchPoolStackerInfo,
  fetchStackingPoolInfo,
  getStacksInfo,
  StackingData,
} from '@secretkeylabs/xverse-core';
import { useQueries } from '@tanstack/react-query';
import { useCallback } from 'react';
import useNetworkSelector from '../useNetwork';
import useWalletSelector from '../useWalletSelector';

const useStackingData = () => {
  const { stxAddress, network } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();

  const results = useQueries({
    queries: [
      {
        queryKey: ['stacking-core-info', network],
        queryFn: () => getStacksInfo(network.address),
      },
      {
        queryKey: ['stacking-delegation-state', stxAddress, network, selectedNetwork],
        queryFn: () => fetchDelegationState(stxAddress, selectedNetwork),
      },
      {
        queryKey: ['stacking-pool-info', network.type],
        queryFn: () => fetchStackingPoolInfo(network.type),
      },
      {
        queryKey: ['pool-stacker-info', stxAddress, network.type],
        queryFn: () => fetchPoolStackerInfo(network.type, stxAddress),
      },
    ],
  });

  const coreInfoData = results[0].data;
  const delegationStateData = results[1].data;
  const poolInfoData = results[2].data;
  const stackerInfoData = results[3].data;

  const isStackingLoading = results.some((result) => result.isLoading);
  const stackingError = results.find(({ error }) => error != null)?.error;
  const refetchStackingData = useCallback(() => {
    results.forEach((result) => result.refetch());
  }, [results]);

  const stackingData: StackingData = {
    poolInfo: poolInfoData!,
    delegationInfo: delegationStateData!,
    coreInfo: coreInfoData!,
    stackerInfo: stackerInfoData,
  };

  return {
    isStackingLoading,
    stackingError,
    stackingData,
    refetchStackingData,
  };
};

export default useStackingData;
