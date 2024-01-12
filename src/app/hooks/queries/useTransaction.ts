import useBtcClient from '@hooks/useBtcClient';
import useWalletSelector from '@hooks/useWalletSelector';
import { fetchBtcTransaction } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

export default function useTransaction(id?: string) {
  const { selectedAccount } = useWalletSelector();
  const btcClient = useBtcClient();

  const fetchTransaction = async () => {
    if (!selectedAccount || !id) {
      return;
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
