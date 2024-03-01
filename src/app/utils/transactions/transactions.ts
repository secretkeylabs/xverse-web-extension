import {
  API_TIMEOUT_MILLI,
  Brc20HistoryTransactionData,
  BtcTransactionData,
  getNetworkURL,
  StacksNetwork,
  StxTransactionData,
} from '@secretkeylabs/xverse-core';
import {
  AddressTransactionWithTransfers,
  MempoolTransaction,
  MempoolTransactionListResponse,
  Transaction,
} from '@stacks/stacks-blockchain-api-types';
import axios from 'axios';

export interface PaginatedResults<T> {
  limit: number;
  offset: number;
  total: number;
  results: T[];
}

export async function getTransferTransactions(reqParams: {
  stxAddress: string;
  network: StacksNetwork;
  limit: number;
  offset: number;
}): Promise<AddressTransactionWithTransfers[]> {
  const { stxAddress, limit, network, offset } = reqParams;
  const apiUrl = `${getNetworkURL(
    network,
  )}/extended/v1/address/${stxAddress}/transactions_with_transfers`;
  const response = await axios.get<PaginatedResults<AddressTransactionWithTransfers>>(apiUrl, {
    params: {
      limit,
      offset,
    },
    timeout: API_TIMEOUT_MILLI,
  });
  return response.data.results;
}

async function getMempoolTransactions({
  stxAddress,
  network,
  offset,
  limit,
}: {
  stxAddress: string;
  network: StacksNetwork;
  offset: number;
  limit: number;
}): Promise<MempoolTransactionListResponse> {
  const apiUrl = `${network.coreApiUrl}/extended/v1/tx/mempool?address=${stxAddress}`;
  const results = await axios.get<MempoolTransactionListResponse>(apiUrl, {
    timeout: API_TIMEOUT_MILLI,
    params: {
      limit,
      offset,
    },
  });
  return results.data;
}

export async function getStxAddressTransactions(
  address: string,
  network: StacksNetwork,
  offset: number,
  limit: number,
) {
  const transactionsWithTransfers = await getTransferTransactions({
    stxAddress: address,
    network,
    limit,
    offset,
  });
  const mempoolTransactions = await getMempoolTransactions({
    stxAddress: address,
    limit,
    offset,
    network,
  });
  return [...mempoolTransactions.results, ...transactionsWithTransfers];
}

export type Tx = MempoolTransaction | Transaction;

export function isAddressTransactionWithTransfers(
  transaction: AddressTransactionWithTransfers | Tx,
): transaction is AddressTransactionWithTransfers {
  return 'tx' in transaction;
}

export function isBtcTransaction(
  tx: AddressTransactionWithTransfers | Tx | BtcTransactionData | Brc20HistoryTransactionData,
): tx is BtcTransactionData {
  return (tx as BtcTransactionData).txType === 'bitcoin';
}

export function isBtcTransactionArr(
  txs:
    | (AddressTransactionWithTransfers | MempoolTransaction)[]
    | BtcTransactionData[]
    | Brc20HistoryTransactionData[],
): txs is BtcTransactionData[] {
  return (txs as BtcTransactionData[])[0].txType === 'bitcoin';
}

export function isBrc20TransactionArr(
  txs:
    | (AddressTransactionWithTransfers | MempoolTransaction)[]
    | BtcTransactionData[]
    | Brc20HistoryTransactionData[],
): txs is BtcTransactionData[] {
  return (txs as Brc20HistoryTransactionData[])[0].txType === 'brc20';
}

export function isBrc20Transaction(
  tx: StxTransactionData | BtcTransactionData | Brc20HistoryTransactionData,
): tx is Brc20HistoryTransactionData {
  return (tx as Brc20HistoryTransactionData).txType === 'brc20';
}

// todo: move this to xverse-core
export const capStxFee = (
  low: number,
  medium: number,
  high: number,
  highCap: number,
): { low: number; medium: number; high: number } => {
  let adjustedMedium = medium;
  let adjustedHigh = high;

  if (highCap < medium) {
    adjustedMedium = highCap;
    adjustedHigh = highCap * 1.25;
  } else if (medium < highCap && highCap < high) {
    adjustedHigh = highCap;
  }

  return { low, medium: adjustedMedium, high: adjustedHigh };
};
