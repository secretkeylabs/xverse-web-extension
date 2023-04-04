import { BtcAddressMempool } from '@secretkeylabs/xverse-core/types/api/blockstream/transactions';
import { fetchPendingOrdinalsTransactions } from '@secretkeylabs/xverse-core/api/btc';
import { useQuery } from '@tanstack/react-query';
import useWalletSelector from '../useWalletSelector';

const usePendingOrdinalTxs = (ordinalUtxoHash: string | undefined) => {
  const { ordinalsAddress, network } = useWalletSelector();

  const fetchOrdinalsMempoolTxs = async (): Promise<BtcAddressMempool[]> =>
    fetchPendingOrdinalsTransactions(ordinalsAddress, network.type);

  let isPending: boolean | undefined = false;
  let pendingTxHash: string | undefined;

  const response = useQuery(['ordinal-pending-transactions'], fetchOrdinalsMempoolTxs);

  if (response.data) {
    response.data.forEach((tx) => {
      tx.vin.forEach((v) => {
        if (v.txid === ordinalUtxoHash) isPending = true;
        pendingTxHash = tx.txid;
      });
    });
  }

  return {
    isPending,
    pendingTxHash,
  };
};

export default usePendingOrdinalTxs;
