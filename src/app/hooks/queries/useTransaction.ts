import useBtcClient from '@hooks/apiClients/useBtcClient';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { fetchBtcTransaction } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

export default function useTransaction(id?: string) {
  const selectedAccount = useSelectedAccount();
  const btcClient = useBtcClient();

  const fetchTransaction = async () => {
    if (!selectedAccount || !id) {
      return null;
    }

    const transaction = await fetchBtcTransaction(
      id,
      selectedAccount.btcAddress,
      selectedAccount.ordinalsAddress,
      btcClient,
    );

    return transaction;
  };

  return useQuery({
    queryKey: ['transaction', id],
    queryFn: fetchTransaction,
    enabled: id !== undefined,
  });
}
