import useBtcClient from '@hooks/useBtcClient';
import useSelectedAccount from '@hooks/useSelectedAccount';
import type { BtcAddressMempool } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

const usePendingOrdinalTxs = (ordinalUtxoHash: string | undefined) => {
  const { ordinalsAddress } = useSelectedAccount();
  const btcClient = useBtcClient();

  const fetchOrdinalsMempoolTxs = async (): Promise<BtcAddressMempool[]> =>
    btcClient.getAddressMempoolTransactions(ordinalsAddress);

  let isPending: boolean | undefined = false;
  let pendingTxHash: string | undefined;

  const response = useQuery({
    queryKey: ['ordinal-pending-transactions'],
    queryFn: fetchOrdinalsMempoolTxs,
  });

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
