import { SettingsNetwork, BtcTransactionData } from '@secretkeylabs/xverse-core';
import { mapTransferTransactionData } from '@secretkeylabs/xverse-core/api/helper';
import { API_TIMEOUT_MILLI } from '@secretkeylabs/xverse-core/constant';
import {
  AddressTransactionWithTransfers,
  MempoolTransactionListResponse,
  MempoolTransaction,
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
  network: SettingsNetwork;
  limit: number;
  offset: number;
}): Promise<AddressTransactionWithTransfers[]> {
  const {
    stxAddress, limit, network, offset,
  } = reqParams;
  const apiUrl = `${network.address}/extended/v1/address/${stxAddress}/transactions_with_transfers`;
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
  network: SettingsNetwork;
  offset: number;
  limit: number;
}): Promise<MempoolTransactionListResponse> {
  const apiUrl = `${network.address}/extended/v1/tx/mempool?address=${stxAddress}`;
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
  network: SettingsNetwork,
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
  const all = [...mempoolTransactions.results, ...transactionsWithTransfers];
  return all;
}

export type Tx = MempoolTransaction | Transaction;

export function isAddressTransactionWithTransfers(
  transaction: AddressTransactionWithTransfers | Tx,
): transaction is AddressTransactionWithTransfers {
  return 'tx' in transaction;
}

export function isBtcTransaction(
  tx: AddressTransactionWithTransfers | Tx | BtcTransactionData,
): tx is BtcTransactionData {
  return (tx as BtcTransactionData).addresses !== undefined;
}

export function isBtcTransactionArr(
  txs: (AddressTransactionWithTransfers | MempoolTransaction)[] | BtcTransactionData[],
): txs is BtcTransactionData[] {
  return (txs as BtcTransactionData[])[0].addresses !== undefined;
}
