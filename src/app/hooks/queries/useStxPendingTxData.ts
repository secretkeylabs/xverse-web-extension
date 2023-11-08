import { fetchStxPendingTxData } from '@secretkeylabs/xverse-core';
import { StoreState } from '@stores/index';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import useNetworkSelector from '../useNetwork';

const useStxPendingTxData = () => {
  const { stxAddress } = useSelector((state: StoreState) => state.walletState);
  const selectedNetwork = useNetworkSelector();
  const result = useQuery({
    queryKey: ['stx-pending-transaction', { stxAddress, selectedNetwork }],
    queryFn: () => fetchStxPendingTxData(stxAddress, selectedNetwork),
  });
  return result;
};

export default useStxPendingTxData;
