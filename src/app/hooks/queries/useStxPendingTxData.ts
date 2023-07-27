import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { fetchStxPendingTxData } from '@secretkeylabs/xverse-core/api';
import { StoreState } from '@stores/index';
import useNetworkSelector from '../useNetwork';

const useStxPendingTxData = () => {
  const { stxAddress } = useSelector((state: StoreState) => state.walletState);
  const selectedNetwork = useNetworkSelector();
  const result = useQuery(['stx-pending-transaction', { stxAddress, selectedNetwork }], () =>
    fetchStxPendingTxData(stxAddress, selectedNetwork),
  );
  return result;
};

export default useStxPendingTxData;
