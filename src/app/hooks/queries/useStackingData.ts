/* eslint-disable no-console */
import useXverseApi from '@hooks/apiClients/useXverseApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { getStacksInfo, type StackingData } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import useWalletSelector from '../useWalletSelector';
import useDelegationState from './useDelegationState';

const useStackingData = () => {
  const { stxAddress } = useSelectedAccount();
  const { network } = useWalletSelector();
  const { data: delegationStateData, isPending: isPendingDelegateState } = useDelegationState();

  const xverseApiClient = useXverseApi();

  const {
    data: coreInfoData,
    refetch: refetchGetStacksInfo,
    isPending: isPendingGetStacksInfo,
  } = useQuery({
    queryKey: ['stacking-core-info', network],
    queryFn: async () => (await getStacksInfo(network.address)) ?? null,
  });

  const {
    data: poolInfoData,
    refetch: refetchFetchStackingPoolInfo,
    isPending: isPendingFetchStackingPoolInfo,
  } = useQuery({
    queryKey: ['stacking-pool-info', network.type],
    queryFn: () => xverseApiClient.fetchStackingPoolInfo(),
  });

  const {
    data: stackerInfoData,
    refetch: refetchFetchPoolStackerInfo,
    isPending: isPendingFetchPoolStackerInfo,
  } = useQuery({
    queryKey: ['pool-stacker-info', stxAddress, network.type],
    queryFn: () => xverseApiClient.fetchPoolStackerInfo(stxAddress),
  });

  const isStackingLoading =
    isPendingGetStacksInfo ||
    isPendingFetchStackingPoolInfo ||
    isPendingFetchPoolStackerInfo ||
    isPendingDelegateState;

  const refetchStackingData = useCallback(() => {
    refetchGetStacksInfo().catch(console.log);
    refetchFetchStackingPoolInfo().catch(console.log);
    refetchFetchPoolStackerInfo().catch(console.log);
  }, [refetchFetchPoolStackerInfo, refetchFetchStackingPoolInfo, refetchGetStacksInfo]);

  // Warning: the non-null assertions here are dangerous, as they assume
  // consumers will check the `isStackingLoading` prop returned below before
  // using them. This isn't always the case, and many parts of the code opt for
  // optional chainig of these values despite the types not indicating that
  // optional chaining is necessary.
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
