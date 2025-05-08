import useStacksAPI from '@hooks/apiClients/useStacksApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import type { StxAddressData } from '@secretkeylabs/xverse-core';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

const useStxWalletData = () => {
  const { stxAddress } = useSelectedAccount();
  const StacksAPI = useStacksAPI();
  const fetchStxWalletData = async (): Promise<StxAddressData> => {
    const [balanceData, nonce] = await Promise.all([
      StacksAPI.getAddressBalance(stxAddress),
      StacksAPI.getAddressNonce(stxAddress),
    ]);
    return {
      ...balanceData,
      balance: balanceData.totalBalance,
      locked: balanceData.lockedBalance,
      nonce,
      transactions: [],
    };
  };

  return useQuery({
    queryKey: ['stx-wallet-data', stxAddress],
    queryFn: fetchStxWalletData,
    enabled: !!stxAddress,
    staleTime: 10 * 1000, // 10 secs
    placeholderData: keepPreviousData,
  });
};

export default useStxWalletData;
