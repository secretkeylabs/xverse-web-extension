import {
  BtcTransactionData,
  mempoolApi,
  rbf,
  RecommendedFeeResponse,
  StxTransactionData,
} from '@secretkeylabs/xverse-core';
import { isLedgerAccount } from '@utils/helper';
import { useCallback, useEffect, useState } from 'react';
import useBtcClient from './useBtcClient';
import useSeedVault from './useSeedVault';
import useWalletSelector from './useWalletSelector';

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

const isBtcTransaction = (
  transaction: BtcTransactionData | StxTransactionData,
): transaction is BtcTransactionData => (transaction as BtcTransactionData).txType === 'bitcoin';

const useRbfTransactionData = (transaction?: BtcTransactionData | StxTransactionData): RbfData => {
  const [isLoading, setIsLoading] = useState(true);
  const [rbfData, setRbfData] = useState<RbfData>({});
  const { accountType, network, selectedAccount } = useWalletSelector();
  const seedVault = useSeedVault();
  const btcClient = useBtcClient();

  const fetchStxData = () => {
    console.log('fetching stx data');

    setRbfData({
      rbfTransaction: undefined,
      rbfTxSummary: {
        currentFee: 0,
        currentFeeRate: 0,
        minimumRbfFee: 0,
        minimumRbfFeeRate: 0,
      },
      rbfRecommendedFees: Object.fromEntries(
        Object.entries({
          medium: { enoughFunds: true, feeRate: 0 },
          high: { enoughFunds: true, feeRate: 0 },
        }).sort((a, b) => {
          const priorityOrder = ['highest', 'higher', 'high', 'medium'];
          return priorityOrder.indexOf(a[0]) - priorityOrder.indexOf(b[0]);
        }),
      ),
      mempoolFees: {
        fastestFee: 0,
        halfHourFee: 0,
        hourFee: 0,
        economyFee: 0,
        minimumFee: 0,
      },
    });

    setIsLoading(false);
  };

  const fetchRbfData = useCallback(async () => {
    if (!selectedAccount || !transaction) {
      setIsLoading(false);
      return;
    }

    if (!isBtcTransaction(transaction)) {
      fetchStxData();
      return;
    }

    console.log('fetching btc data');

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
  }, [selectedAccount, transaction, accountType, network.type, seedVault, btcClient]);

  useEffect(() => {
    fetchRbfData();
  }, [fetchRbfData]);

  return { ...rbfData, isLoading };
};

export default useRbfTransactionData;
