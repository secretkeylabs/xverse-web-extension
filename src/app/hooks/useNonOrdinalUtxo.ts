import { getNonOrdinalUtxo, UTXO } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { REFETCH_UNSPENT_UTXO_TIME } from '@utils/constants';
import { getTimeForNonOrdinalTransferTransaction } from '@utils/localStorage';
import useBtcClient from './useBtcClient';
import useWalletSelector from './useWalletSelector';

const useNonOrdinalUtxos = () => {
  const { network, ordinalsAddress } = useWalletSelector();
  const btcClient = useBtcClient();

  const fetchNonOrdinalUtxo = async () => {
    const lastTransactionTime = await getTimeForNonOrdinalTransferTransaction(ordinalsAddress);
    if (!lastTransactionTime) {
      return getNonOrdinalUtxo(ordinalsAddress, btcClient, network.type);
    }
    const diff = new Date().getTime() - Number(lastTransactionTime);
    if (diff > REFETCH_UNSPENT_UTXO_TIME) {
      return getNonOrdinalUtxo(ordinalsAddress, btcClient, network.type);
    }
    return [] as UTXO[];
  };

  const { data: unspentUtxos, isLoading } = useQuery({
    keepPreviousData: false,
    queryKey: [`getNonOrdinalsUtxo-${ordinalsAddress}`],
    queryFn: fetchNonOrdinalUtxo,
  });
  return {
    unspentUtxos,
    isLoading,
  };
};

export default useNonOrdinalUtxos;
