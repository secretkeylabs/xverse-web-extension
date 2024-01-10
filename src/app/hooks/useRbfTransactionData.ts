import {
  BtcTransactionData,
  RecommendedFeeResponse,
  SettingsNetwork,
  StacksTransaction,
  StxTransactionData,
  mempoolApi,
  microstacksToStx,
  rbf,
} from '@secretkeylabs/xverse-core';
import { deserializeTransaction, estimateTransaction } from '@stacks/transactions';
import { isLedgerAccount } from '@utils/helper';
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
  thresholdHighStacksFee?: number,
): RbfRecommendedFees => {
  let lowerFee = lowerFeeRate;
  let higherFee = higherFeeRate;

  if (thresholdHighStacksFee) {
    // adding a fee cap

    if (higherFee > thresholdHighStacksFee) {
      higherFee = thresholdHighStacksFee;
    }

    if (lowerFee > thresholdHighStacksFee) {
      lowerFee = thresholdHighStacksFee * 0.75;
    }
  }

  const bigNumLowerFee = BigNumber(lowerFee);
  const bigNumHigherFee = BigNumber(higherFee);

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
  const { accountType, network, selectedAccount, stxAvailableBalance, feeMultipliers } =
    useWalletSelector();
  const seedVault = useSeedVault();
  const btcClient = useBtcClient();
  const selectedNetwork = useNetworkSelector();

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

      const [slow, medium, high] = await estimateTransaction(
        unsignedTx.payload,
        undefined,
        selectedNetwork,
      );

      let minimumFee = fee.multipliedBy(1.25).toNumber();
      if (!Number.isSafeInteger(minimumFee)) {
        // round up the fee to the nearest integer
        minimumFee = Math.ceil(minimumFee);
      }

      let feePresets: RbfRecommendedFees = {};
      const mediumFee = medium.fee;
      const highFee = high.fee;
      let higherFee = highFee * 1.25;
      const highestFee = fee.multipliedBy(1.5).toNumber();

      if (fee.lt(BigNumber(mediumFee))) {
        feePresets = constructRecommendedFees(
          'medium',
          mediumFee,
          'high',
          highFee,
          stxAvailableBalance,
          feeMultipliers?.thresholdHighStacksFee,
        );
      } else if (fee.gt(BigNumber(mediumFee)) && fee.lt(BigNumber(highFee))) {
        feePresets = constructRecommendedFees(
          'high',
          highFee,
          'higher',
          higherFee,
          stxAvailableBalance,
          feeMultipliers?.thresholdHighStacksFee,
        );
      } else {
        higherFee = fee.multipliedBy(1.25).toNumber();

        feePresets = constructRecommendedFees(
          'higher',
          higherFee,
          'highest',
          highestFee,
          stxAvailableBalance,
          feeMultipliers?.thresholdHighStacksFee,
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
      setIsLoading(true);

      const rbfTx = new rbf.RbfTransaction(transaction, {
        ...selectedAccount,
        accountType: accountType || 'software',
        accountId:
          isLedgerAccount(selectedAccount) && selectedAccount.deviceAccountIndex
            ? selectedAccount.deviceAccountIndex
            : selectedAccount.id,
        network: network.type,
        esploraProvider: btcClient,
        getSeedPhrase: seedVault.getSeed,
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
