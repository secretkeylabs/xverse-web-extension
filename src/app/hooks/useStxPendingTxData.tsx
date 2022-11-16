import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { fetchStxPendingTxData } from '@secretkeylabs/xverse-core/transactions';
import { StoreState } from '@stores/index';

const useStxPendingTxData = () => {
  const { stxAddress, network } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const result = useQuery(
    ['stx-pending-transaction', { stxAddress, network }],
    () => fetchStxPendingTxData(stxAddress, network),
  );
  return result;
};

export default useStxPendingTxData;
