import { useQueries } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  fetchDelegationState,
  fetchPoolStackerInfo,
  fetchStackingPoolInfo,
  getStacksInfo,
  StackingData,
} from '@secretkeylabs/xverse-core';
import useWalletSelector from '../useWalletSelector';
import useNetworkSelector from '../useNetwork';

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
        queryKey: ['stacking-delegation-state', stxAddress, network],
        queryFn: () => fetchDelegationState(stxAddress, selectedNetwork),
      },
      {
        queryKey: ['stacking-pool-info'],
        queryFn: () => fetchStackingPoolInfo(),
      },
      {
        queryKey: ['pool-stacker-info', stxAddress],
        queryFn: () => fetchPoolStackerInfo(stxAddress),
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
    poolInfo: poolInfoData,
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
