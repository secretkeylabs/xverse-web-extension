import useWalletSelector from '@hooks/useWalletSelector';
import {
  BtcTransactionData, FungibleToken, StxAddressData, StxTransactionData,
} from '@secretkeylabs/xverse-core/types';
import {
  fetchBtcTransactionsData, fetchStxAddressData,
} from '@secretkeylabs/xverse-core/api';
import { useQuery } from '@tanstack/react-query';
import { CurrencyTypes, initialNetworksList, PAGINATION_LIMIT } from '@utils/constants';

function getFtTransactions(
  stxTransactions: StxTransactionData[],
  fungibleToken?: FungibleToken,
): StxTransactionData[] {
  return stxTransactions.filter((transaction) => transaction.contractCall?.contract_id === fungibleToken?.principal);
}

export function removeDuplicatePendingTransactions(
  totalTransactions: StxTransactionData[],
): StxTransactionData[] {
  const confirmedTransactions = totalTransactions.filter((v, i, a) => v.txStatus === 'success');

  const pendingTransactions = totalTransactions.filter((v, i, a) => v.txStatus === 'pending');

  confirmedTransactions.forEach((confirmedTx) => {
    // check if object exist in pending transactions
    // if exists, remove from pending transactions

    const index = pendingTransactions.findIndex((pendingTx) => pendingTx.txid === confirmedTx.txid);

    if (index > -1) {
      pendingTransactions.splice(index, 1);
    }
  });

  const filteredArray: StxTransactionData[] = [];

  pendingTransactions.forEach((tx) => {
    filteredArray.push(tx);
  });
  confirmedTransactions.forEach((tx) => {
    filteredArray.push(tx);
  });

  return filteredArray;
}

export default function useTransactions(coinType: CurrencyTypes, fungibleToken?: FungibleToken) {
  const { network, stxAddress, btcAddress } = useWalletSelector();
  const fetchTransactions = async (): Promise<StxTransactionData[] | BtcTransactionData[]> => {
    try {
      if (coinType === 'STX') {
        const stxAddressData = await fetchStxAddressData(
          stxAddress,
          network === 'Mainnet' ? initialNetworksList[0] : initialNetworksList[1],
          0,
          PAGINATION_LIMIT,
        );
        return removeDuplicatePendingTransactions(stxAddressData.transactions);
      }
      if (coinType === 'BTC') {
        const btcData = await fetchBtcTransactionsData(
          btcAddress,
          network === 'Mainnet' ? initialNetworksList[0] : initialNetworksList[1],
        );
        return btcData.transactions;
      }
      if (coinType === 'FT') {
        const stxAddressData: StxAddressData = await fetchStxAddressData(
          stxAddress,
          network === 'Mainnet' ? initialNetworksList[0] : initialNetworksList[1],
          0,
          PAGINATION_LIMIT,
        );
        return getFtTransactions(
          stxAddressData.transactions as StxTransactionData[],
          fungibleToken,
        );
      }
      throw new Error('Invalid Coin');
    } catch (err) {
      return Promise.reject(err);
    }
  };

  return useQuery({
    queryKey: [`transactions-${coinType}`],
    queryFn: fetchTransactions,
  });
}
