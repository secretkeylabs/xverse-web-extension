import {
  API_TIMEOUT_MILLI,
  StacksNetwork,
  getNetworkURL,
  type APIGetRunesActivityForAddressResponse,
  type AppInfo,
  type Brc20HistoryTransactionData,
  type BtcTransactionData,
  type GetRunesActivityForAddressEvent,
  type StxTransactionData,
} from '@secretkeylabs/xverse-core';
import {
  type AddressTransactionWithTransfers,
  type MempoolTransaction,
  type MempoolTransactionListResponse,
  type Transaction,
} from '@stacks/stacks-blockchain-api-types';
import axios from 'axios';

interface PaginatedResults<T> {
  limit: number;
  offset: number;
  total: number;
  results: T[];
}

async function getTransferTransactions(reqParams: {
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
  tx:
    | AddressTransactionWithTransfers
    | Tx
    | BtcTransactionData
    | StxTransactionData
    | Brc20HistoryTransactionData
    | GetRunesActivityForAddressEvent,
): tx is BtcTransactionData {
  return (tx as BtcTransactionData).txType === 'bitcoin';
}

export function isBtcTransactionArr(
  txs:
    | (AddressTransactionWithTransfers | MempoolTransaction)[]
    | BtcTransactionData[]
    | Brc20HistoryTransactionData[]
    | APIGetRunesActivityForAddressResponse,
): txs is BtcTransactionData[] {
  return (txs as BtcTransactionData[])[0].txType === 'bitcoin';
}

export function isBrc20TransactionArr(
  txs:
    | (AddressTransactionWithTransfers | MempoolTransaction)[]
    | BtcTransactionData[]
    | Brc20HistoryTransactionData[]
    | APIGetRunesActivityForAddressResponse,
): txs is BtcTransactionData[] {
  return (txs as Brc20HistoryTransactionData[])[0].txType === 'brc20';
}

export function isBrc20Transaction(
  tx:
    | StxTransactionData
    | BtcTransactionData
    | Brc20HistoryTransactionData
    | GetRunesActivityForAddressEvent,
): tx is Brc20HistoryTransactionData {
  return (tx as Brc20HistoryTransactionData).txType === 'brc20';
}

// todo: move this to xverse-core
export const modifyRecommendedStxFees = (
  baseFees: {
    low: number;
    medium: number;
    high: number;
  },
  appInfo: AppInfo | undefined | null,
): { low: number; medium: number; high: number } => {
  const multiplier = appInfo?.stxSendTxMultiplier || 1;
  const highCap = appInfo?.thresholdHighStacksFee;

  let adjustedLow = Math.round(baseFees.low * multiplier);
  let adjustedMedium = Math.round(baseFees.medium * multiplier);
  let adjustedHigh = Math.round(baseFees.high * multiplier);

  if (highCap && highCap < adjustedMedium) {
    adjustedLow = adjustedLow < highCap ? adjustedLow : Math.round(highCap * 0.75);
    adjustedMedium = highCap;
    adjustedHigh = Math.round(highCap * 1.25);
  } else if (highCap && highCap < adjustedHigh) {
    adjustedHigh = highCap;
  }

  return { low: adjustedLow, medium: adjustedMedium, high: adjustedHigh };
};
export function isRuneTransactionArr(
  txs:
    | (AddressTransactionWithTransfers | MempoolTransaction)[]
    | BtcTransactionData[]
    | Brc20HistoryTransactionData[]
    | APIGetRunesActivityForAddressResponse,
): txs is APIGetRunesActivityForAddressResponse {
  return !Array.isArray(txs);
}

export function isRuneTransaction(
  tx:
    | StxTransactionData
    | BtcTransactionData
    | Brc20HistoryTransactionData
    | GetRunesActivityForAddressEvent,
): tx is GetRunesActivityForAddressEvent {
  return (tx as GetRunesActivityForAddressEvent).burned !== undefined;
}
