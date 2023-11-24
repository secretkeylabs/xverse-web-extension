import useWalletSelector from '@hooks/useWalletSelector';
import { fetchBtcTransaction } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

export default function useTransaction(id: string) {
  const { selectedAccount, network } = useWalletSelector();

  const fetchTransaction = async () => {
    if (!selectedAccount || !id) {
      return;
    }

    const transaction = await fetchBtcTransaction(
      id,
      selectedAccount.btcAddress,
      selectedAccount.ordinalsAddress,
      network.type,
    );

    return transaction;
  };

  return useQuery({
    queryKey: [`transaction-${id}`],
    queryFn: fetchTransaction,
  });
}
