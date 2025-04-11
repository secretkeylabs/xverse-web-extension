import useBtcClient from '@hooks/apiClients/useBtcClient';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { useQuery } from '@tanstack/react-query';

function usePendingOrdinalTxs(lookup?: { txid: string; vout: number });
function usePendingOrdinalTxs(lookup?: { output: string });
function usePendingOrdinalTxs(lookup?: { txid?: string; vout?: number; output?: string }) {
  let { txid, vout } = lookup || {};

  if (lookup?.output) {
    const [txidOverride, voutOverride] = lookup.output.split(':');

    if (txidOverride && voutOverride) {
      txid = txidOverride;
      vout = parseInt(voutOverride, 10);
    }
  }

  const { ordinalsAddress } = useSelectedAccount();
  const btcClient = useBtcClient();

  const fetchOrdinalsMempoolTxs = async () => {
    if (!txid || !vout) return { isPending: false };

    const mempoolTxns = await btcClient.getAddressMempoolTransactions(ordinalsAddress);

    const spendingTxn = mempoolTxns.find((tx) =>
      tx.vin.some((v) => v.txid === txid && v.vout === vout),
    );

    return {
      isPending: !!spendingTxn,
      pendingTxid: spendingTxn?.txid,
    };
  };

  const response = useQuery({
    queryKey: ['ordinal-pending-transactions', txid, vout],
    queryFn: fetchOrdinalsMempoolTxs,
  });

  return {
    isPending: response.data?.isPending,
    pendingTxid: response.data?.pendingTxid,
    isLoading: response.isLoading,
  };
}

export default usePendingOrdinalTxs;
