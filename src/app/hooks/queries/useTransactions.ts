import useBtcClient from '@hooks/apiClients/useBtcClient';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  APIGetRunesActivityForAddressResponse,
  Brc20HistoryTransactionData,
  BtcTransactionData,
  fetchBtcTransactionsData,
  getBrc20History,
  getXverseApiClient,
} from '@secretkeylabs/xverse-core';
import {
  AddressTransactionWithTransfers,
  MempoolTransaction,
} from '@stacks/stacks-blockchain-api-types';
import { useQuery } from '@tanstack/react-query';
import { CurrencyTypes, PAGINATION_LIMIT } from '@utils/constants';
import { handleRetries } from '@utils/query';
import { getStxAddressTransactions } from '@utils/transactions/transactions';
import useNetworkSelector from '../useNetwork';

export default function useTransactions(
  coinType: CurrencyTypes,
  brc20Token: string | null,
  runeToken: string | null,
) {
  const { stxAddress, btcAddress, ordinalsAddress } = useSelectedAccount();
  const { network, hasActivatedOrdinalsKey } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();
  const btcClient = useBtcClient();
  const fetchTransactions = async (): Promise<
    | BtcTransactionData[]
    | (AddressTransactionWithTransfers | MempoolTransaction)[]
    | Brc20HistoryTransactionData[]
    | APIGetRunesActivityForAddressResponse
  > => {
    if (coinType === 'FT' && brc20Token) {
      return getBrc20History(network.type, ordinalsAddress, brc20Token);
    }
    if (coinType === 'FT' && runeToken) {
      return getXverseApiClient(network.type).getRuneTxHistory(
        ordinalsAddress,
        runeToken,
        0,
        PAGINATION_LIMIT,
      );
    }
    if (coinType === 'STX' || coinType === 'FT' || coinType === 'NFT') {
      return getStxAddressTransactions(stxAddress, selectedNetwork, 0, PAGINATION_LIMIT);
    }
    if (coinType === 'BTC') {
      return fetchBtcTransactionsData(
        btcAddress,
        ordinalsAddress,
        btcClient,
        hasActivatedOrdinalsKey as boolean,
      );
    }
    return [];
  };

  return useQuery({
    queryKey: ['transactions', coinType, brc20Token, runeToken],
    queryFn: fetchTransactions,
    staleTime: 10 * 1000, // 10 secs
    retry: handleRetries,
  });
}
