import useSelectedAccount from '@hooks/useSelectedAccount';
import { fetchStxPendingTxData, type StxPendingTxData } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import useNetworkSelector from '../useNetwork';

const useStxPendingTxData = () => {
  const { stxAddress } = useSelectedAccount();
  const selectedNetwork = useNetworkSelector();
  const result = useQuery({
    queryKey: ['stx-pending-transaction', { stxAddress, selectedNetwork }],
    queryFn: (): Promise<StxPendingTxData> => fetchStxPendingTxData(stxAddress, selectedNetwork),
  });
  return result;
};

export default useStxPendingTxData;
