import useStxWalletData from '@hooks/queries/useStxWalletData';
import {
  estimateStacksTransaction,
  mempoolApi,
  microstacksToStx,
  rbf,
  type BtcTransactionData,
  type RecommendedFeeResponse,
  type SettingsNetwork,
  type StacksTransaction,
  type StxTransactionData,
} from '@secretkeylabs/xverse-core';
import { deserializeTransaction } from '@stacks/transactions';
import { isLedgerAccount } from '@utils/helper';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useBtcClient from './apiClients/useBtcClient';
import useNetworkSelector from './useNetwork';
import useSelectedAccount from './useSelectedAccount';
import useWalletSelector from './useWalletSelector';

// TODO: move the types and helper functions below to xverse-core

type TierFees = {
  enoughFunds: boolean;
  fee?: number;
  feeRate: number;
};

type RbfRecommendedFees = {
  medium?: TierFees;
  high?: TierFees;
  higher?: TierFees;
  highest?: TierFees;
};

type RbfData = {
  rbfTransaction?: InstanceType<typeof rbf.RbfTransaction>;
  rbfTxSummary?: {
    currentFee: number;
    currentFeeRate: number;
    minimumRbfFee: number;
    minimumRbfFeeRate: number;
  };
  rbfRecommendedFees?: RbfRecommendedFees;
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

const constructRecommendedFees = (
  lowerName: keyof RbfRecommendedFees,
  lowerFeeRate: number,
  higherName: keyof RbfRecommendedFees,
  higherFeeRate: number,
  stxAvailableBalance: string,
): RbfRecommendedFees => {
  const bigNumLowerFee = BigNumber(lowerFeeRate);
  const bigNumHigherFee = BigNumber(higherFeeRate);

  return {
    [lowerName]: {
      enoughFunds: bigNumLowerFee.lte(BigNumber(stxAvailableBalance)),
      feeRate: microstacksToStx(bigNumLowerFee).toNumber(),
      fee: microstacksToStx(bigNumLowerFee).toNumber(),
    },
    [higherName]: {
      enoughFunds: bigNumHigherFee.lte(BigNumber(stxAvailableBalance)),
      feeRate: microstacksToStx(bigNumHigherFee).toNumber(),
      fee: microstacksToStx(bigNumHigherFee).toNumber(),
    },
  };
};

const sortFees = (fees: RbfRecommendedFees) =>
  Object.fromEntries(
    Object.entries(fees).sort((a, b) => {
      const priorityOrder = ['highest', 'higher', 'high', 'medium'];
      return priorityOrder.indexOf(a[0]) - priorityOrder.indexOf(b[0]);
    }),
  );

const useRbfTransactionData = (transaction?: BtcTransactionData | StxTransactionData): RbfData => {
  const [isLoading, setIsLoading] = useState(true);
  const [rbfData, setRbfData] = useState<RbfData>({});
  const selectedAccount = useSelectedAccount();
  const { selectedAccountType, network, feeMultipliers } = useWalletSelector();
  const { data: stxData } = useStxWalletData();
  const btcClient = useBtcClient();
  const selectedNetwork = useNetworkSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'SPEED_UP_TRANSACTION' });
  const navigate = useNavigate();

  // TODO: move the STX RBF calculations to xverse-core and add unit tests
  const fetchStxData = useCallback(async () => {
    if (!transaction || isBtcTransaction(transaction)) {
      return;
    }

    try {
      setIsLoading(true);

      const { fee } = transaction;
      const txRaw: string = await getRawTransaction(transaction.txid, network);
      const unsignedTx: StacksTransaction = deserializeTransaction(txRaw);

      const [slow, medium, high] = await estimateStacksTransaction(
        unsignedTx.payload,
        selectedNetwork,
      );

      let feePresets: RbfRecommendedFees;
      let mediumFee = medium.fee;
      let highFee = high.fee;
      const higherFee = fee.multipliedBy(1.25).toNumber();
      const highestFee = fee.multipliedBy(1.5).toNumber();

      if (feeMultipliers?.thresholdHighStacksFee) {
        if (high.fee > feeMultipliers.thresholdHighStacksFee) {
          // adding a fee cap
          highFee = feeMultipliers.thresholdHighStacksFee * 1.5;
          mediumFee = feeMultipliers.thresholdHighStacksFee;
        }
      }

      let minimumFee = fee.multipliedBy(1.25).toNumber();
      if (!Number.isSafeInteger(minimumFee)) {
        // round up the fee to the nearest integer
        minimumFee = Math.ceil(minimumFee);
      }

      if (fee.lt(BigNumber(mediumFee))) {
        feePresets = constructRecommendedFees(
          'medium',
          mediumFee,
          'high',
          highFee,
          stxData?.availableBalance.toString() ?? '0',
        );
      } else {
        feePresets = constructRecommendedFees(
          'higher',
          higherFee,
          'highest',
          highestFee,
          stxData?.availableBalance.toString() ?? '0',
        );
      }

      setRbfData({
        rbfTransaction: undefined,
        rbfTxSummary: {
          currentFee: microstacksToStx(fee).toNumber(),
          currentFeeRate: microstacksToStx(fee).toNumber(),
          minimumRbfFee: microstacksToStx(BigNumber(minimumFee)).toNumber(),
          minimumRbfFeeRate: microstacksToStx(BigNumber(minimumFee)).toNumber(),
        },
        rbfRecommendedFees: sortFees(feePresets),
        mempoolFees: {
          fastestFee: microstacksToStx(BigNumber(high.fee)).toNumber(),
          halfHourFee: microstacksToStx(BigNumber(medium.fee)).toNumber(),
          hourFee: microstacksToStx(BigNumber(slow.fee)).toNumber(),
          economyFee: microstacksToStx(BigNumber(slow.fee)).toNumber(),
          minimumFee: microstacksToStx(BigNumber(slow.fee)).toNumber(),
        },
      });
    } catch (err: any) {
      toast.error(t('SOMETHING_WENT_WRONG'));
      navigate(-1);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [transaction, network, selectedNetwork, feeMultipliers, stxData, t, navigate]);

  const fetchRbfData = useCallback(async () => {
    if (!selectedAccount || !transaction) {
      return;
    }

    if (!isBtcTransaction(transaction)) {
      return fetchStxData();
    }

    try {
      setIsLoading(true);

      const rbfTx = new rbf.RbfTransaction(transaction, {
        ...selectedAccount,
        accountType: selectedAccountType || 'software',
        accountId:
          isLedgerAccount(selectedAccount) && selectedAccount.deviceAccountIndex
            ? selectedAccount.deviceAccountIndex
            : selectedAccount.id,
        network: network.type,
        esploraProvider: btcClient,
      });

      const mempoolFees = await mempoolApi.getRecommendedFees(network.type);
      const rbfRecommendedFeesResponse = await rbfTx.getRbfRecommendedFees(mempoolFees);

      const rbfTransactionSummary = await rbf.getRbfTransactionSummary(btcClient, transaction.txid);

      setRbfData({
        rbfTransaction: rbfTx,
        rbfTxSummary: rbfTransactionSummary,
        rbfRecommendedFees: sortFees(rbfRecommendedFeesResponse),
        mempoolFees,
      });
    } catch (err: any) {
      toast.error(t('SOMETHING_WENT_WRONG'));
      navigate(-1);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedAccount,
    transaction,
    selectedAccountType,
    network.type,
    btcClient,
    fetchStxData,
    t,
    navigate,
  ]);

  useEffect(() => {
    fetchRbfData();
  }, [fetchRbfData]);

  return { ...rbfData, isLoading };
};

export default useRbfTransactionData;
