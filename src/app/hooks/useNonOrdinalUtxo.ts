import { getNonOrdinalUtxo } from '@secretkeylabs/xverse-core/api';
import { UTXO } from '@secretkeylabs/xverse-core/types';
import { useQuery } from '@tanstack/react-query';
import { REFETCH_UNSPENT_UTXO_TIME } from '@utils/constants';
import { getTimeForNonOrdinalTransferTransaction } from '@utils/localStorage';
import useWalletSelector from './useWalletSelector';

const useNonOrdinalUtxos = () => {
  const { network, ordinalsAddress } = useWalletSelector();

  const fetchNonOrdinalUtxo = async () => {
    const lastTransactionTime = await getTimeForNonOrdinalTransferTransaction(ordinalsAddress);
    const shouldGetNonOrdinalUtxo =
      !lastTransactionTime ||
      new Date().getTime() - Number(lastTransactionTime) > REFETCH_UNSPENT_UTXO_TIME;
    if (shouldGetNonOrdinalUtxo) {
      return await getNonOrdinalUtxo(ordinalsAddress, network.type);
    }
    return [] as UTXO[];
  };

  const {
    data: unspentUtxos,
    isLoading,
    error,
  } = useQuery({
    keepPreviousData: false,
    queryKey: [`getNonOrdinalsUtxo-${ordinalsAddress}`],
    queryFn: fetchNonOrdinalUtxo,
  });
  return {
    unspentUtxos,
    isLoading,
    error,
  };
};

export default useNonOrdinalUtxos;
