import {
  fetchPoolStackerInfo,
  fetchStackingPoolInfo,
  getStacksInfo,
  StackingData,
} from '@secretkeylabs/xverse-core';
import { useQueries } from '@tanstack/react-query';
import { useCallback } from 'react';
import useWalletSelector from '../useWalletSelector';
import useDelegationState from './useDelegationState';

const useStackingData = () => {
  const { stxAddress, network } = useWalletSelector();
  const { data: delegationStateData, isLoading: delegateStateIsLoading } = useDelegationState();

  const results = useQueries({
    queries: [
      {
        queryKey: ['stacking-core-info', network],
        queryFn: () => getStacksInfo(network.address),
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
  const poolInfoData = results[1].data;
  const stackerInfoData = results[2].data;

  const isStackingLoading = results.some((result) => result.isLoading) || delegateStateIsLoading;
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
    stackingData,
    refetchStackingData,
  };
};

export default useStackingData;
