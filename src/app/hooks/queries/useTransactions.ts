import useBtcClient from '@hooks/apiClients/useBtcClient';
import useXverseApi from '@hooks/apiClients/useXverseApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  fetchBtcTransactionsData,
  getBrc20History,
  type APIGetRunesActivityForAddressResponse,
  type Brc20HistoryTransactionData,
  type BtcTransactionData,
} from '@secretkeylabs/xverse-core';
import type {
  AddressTransactionWithTransfers,
  MempoolTransaction,
} from '@stacks/stacks-blockchain-api-types';
import { useQuery } from '@tanstack/react-query';
import { PAGINATION_LIMIT, type CurrencyTypes } from '@utils/constants';
import { handleRetries } from '@utils/query';
import { getStxAddressTransactions } from '@utils/transactions/transactions';
import useNetworkSelector from '../useNetwork';

export default function useTransactions(
  coinType: CurrencyTypes,
  brc20Token: string | null,
  runeToken: string | null,
) {
  const xverseApiClient = useXverseApi();
  const selectedAccount = useSelectedAccount();
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
      return getBrc20History(network.type, selectedAccount.ordinalsAddress, brc20Token);
    }
    if (coinType === 'FT' && runeToken) {
      return xverseApiClient.getRuneTxHistory(
        selectedAccount.ordinalsAddress,
        runeToken,
        0,
        PAGINATION_LIMIT,
      );
    }
    if (coinType === 'STX' || coinType === 'FT' || coinType === 'NFT') {
      return getStxAddressTransactions(
        selectedAccount.stxAddress,
        selectedNetwork,
        0,
        PAGINATION_LIMIT,
      );
    }
    if (coinType === 'BTC') {
      return fetchBtcTransactionsData(
        selectedAccount,
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
