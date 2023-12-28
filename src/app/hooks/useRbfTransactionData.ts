import {
  BtcTransactionData,
  mempoolApi,
  rbf,
  RecommendedFeeResponse,
  SettingsNetwork,
  StacksTransaction,
  StxTransactionData,
} from '@secretkeylabs/xverse-core';
import { BufferReader, deserializeTransaction, estimateTransaction } from '@stacks/transactions';
import { isLedgerAccount, microStxToStx } from '@utils/helper';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useState } from 'react';
import useBtcClient from './useBtcClient';
import useNetworkSelector from './useNetwork';
import useSeedVault from './useSeedVault';
import useWalletSelector from './useWalletSelector';

// TODO: move the types and helper functions below to xverse-core

type TierFees = {
  enoughFunds: boolean;
  fee?: number;
  feeRate: number;
};

type RbfData = {
  rbfTransaction?: InstanceType<typeof rbf.RbfTransaction>;
  rbfTxSummary?: {
    currentFee: number;
    currentFeeRate: number;
    minimumRbfFee: number;
    minimumRbfFeeRate: number;
  };
  rbfRecommendedFees?: {
    medium?: TierFees;
    high?: TierFees;
    higher?: TierFees;
    highest?: TierFees;
  };
  mempoolFees?: RecommendedFeeResponse;
  isLoading?: boolean;
};

export const isBtcTransaction = (
  transaction: BtcTransactionData | StxTransactionData,
): transaction is BtcTransactionData => transaction?.txType === 'bitcoin';

interface LatestNonceResponse {
  last_mempool_tx_nonce: number;
  last_executed_tx_nonce: number;
  possible_next_nonce: number;
  detected_missing_nonces: Array<number>;
}

export async function getLatestNonce(
  stxAddress: string,
  network: SettingsNetwork,
): Promise<LatestNonceResponse> {
  const baseUrl = network?.address;
  const apiUrl = `${baseUrl}/extended/v1/address/${stxAddress}/nonces`;
  return axios.get<LatestNonceResponse>(apiUrl).then((response) => response.data);
}

interface RawTransactionResponse {
  raw_tx: string;
}

export async function getRawTransaction(txId: string, network: SettingsNetwork): Promise<string> {
  const baseUrl = network?.address;
  const apiUrl = `${baseUrl}/extended/v1/tx/${txId}/raw`;

  return axios.get<RawTransactionResponse>(apiUrl).then((response) => response.data.raw_tx);
}

export function convertStringHexToBufferReader(strHex: string): BufferReader {
  return strHex.slice(0, 2).toLowerCase() === '0x'
    ? new BufferReader(Buffer.from(strHex.slice(2), 'hex'))
    : new BufferReader(Buffer.from(strHex, 'hex'));
}

const useRbfTransactionData = (transaction?: BtcTransactionData | StxTransactionData): RbfData => {
  const [isLoading, setIsLoading] = useState(true);
  const [rbfData, setRbfData] = useState<RbfData>({});
  const { accountType, network, selectedAccount, stxAvailableBalance, feeMultipliers } =
    useWalletSelector();
  const seedVault = useSeedVault();
  const btcClient = useBtcClient();
  const selectedNetwork = useNetworkSelector();

  const fetchStxData = useCallback(async () => {
    if (!transaction || isBtcTransaction(transaction) || !transaction.tokenTransfer) {
      return;
    }

    try {
      const fee = microStxToStx(transaction.fee);
      const txRaw: string = await getRawTransaction(transaction.txid, network);
      const unsignedTx: StacksTransaction = deserializeTransaction(
        convertStringHexToBufferReader(txRaw),
      );

      const [slow, medium, high] = await estimateTransaction(
        unsignedTx.payload,
        undefined,
        selectedNetwork,
      );

      const minimumFee = fee.multipliedBy(1.25);
      let highFee = high.fee;
      let mediumFee = medium.fee;

      if (feeMultipliers && highFee > BigInt(feeMultipliers?.thresholdHighStacksFee)) {
        highFee = feeMultipliers.thresholdHighStacksFee;
      }

      if (feeMultipliers && mediumFee > BigInt(feeMultipliers?.thresholdHighStacksFee)) {
        mediumFee = feeMultipliers.thresholdHighStacksFee * 0.75;
      }

      setRbfData({
        rbfTransaction: undefined,
        rbfTxSummary: {
          currentFee: fee.toNumber(),
          currentFeeRate: fee.toNumber(),
          minimumRbfFee: minimumFee.toNumber(),
          minimumRbfFeeRate: minimumFee.toNumber(),
        },
        rbfRecommendedFees: Object.fromEntries(
          Object.entries({
            medium: {
              enoughFunds: !BigNumber(mediumFee).gt(BigNumber(stxAvailableBalance)),
              feeRate: microStxToStx(mediumFee).toNumber(),
              fee: microStxToStx(mediumFee).toNumber(),
            },
            high: {
              enoughFunds: !BigNumber(highFee).gt(BigNumber(stxAvailableBalance)),
              feeRate: microStxToStx(highFee).toNumber(),
              fee: microStxToStx(highFee).toNumber(),
            },
          }).sort((a, b) => {
            const priorityOrder = ['highest', 'higher', 'high', 'medium'];
            return priorityOrder.indexOf(a[0]) - priorityOrder.indexOf(b[0]);
          }),
        ),
        mempoolFees: {
          fastestFee: microStxToStx(high.fee).toNumber(),
          halfHourFee: microStxToStx(medium.fee).toNumber(),
          hourFee: microStxToStx(slow.fee).toNumber(),
          economyFee: microStxToStx(slow.fee).toNumber(),
          minimumFee: microStxToStx(slow.fee).toNumber(),
        },
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [transaction, network, selectedNetwork, feeMultipliers, stxAvailableBalance]);

  const fetchRbfData = useCallback(async () => {
    if (!selectedAccount || !transaction) {
      setIsLoading(false);
      return;
    }

    if (!isBtcTransaction(transaction)) {
      return fetchStxData();
    }

    try {
      const rbfTx = new rbf.RbfTransaction(transaction, {
        ...selectedAccount,
        accountType: accountType || 'software',
        accountId:
          isLedgerAccount(selectedAccount) && selectedAccount.deviceAccountIndex
            ? selectedAccount.deviceAccountIndex
            : selectedAccount.id,
        network: network.type,
        esploraProvider: btcClient,
        seedVault,
      });

      const mempoolFees = await mempoolApi.getRecommendedFees(network.type);
      const rbfRecommendedFeesResponse = await rbfTx.getRbfRecommendedFees(mempoolFees);

      const rbfTransactionSummary = await rbf.getRbfTransactionSummary(btcClient, transaction.txid);

      setRbfData({
        rbfTransaction: rbfTx,
        rbfTxSummary: rbfTransactionSummary,
        rbfRecommendedFees: Object.fromEntries(
          Object.entries(rbfRecommendedFeesResponse).sort((a, b) => {
            const priorityOrder = ['highest', 'higher', 'high', 'medium'];
            return priorityOrder.indexOf(a[0]) - priorityOrder.indexOf(b[0]);
          }),
        ),
        mempoolFees,
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, transaction, accountType, network.type, seedVault, btcClient, fetchStxData]);

  useEffect(() => {
    fetchRbfData();
  }, [fetchRbfData]);

  return { ...rbfData, isLoading };
};

export default useRbfTransactionData;
