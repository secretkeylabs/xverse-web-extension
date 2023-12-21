import {
  BtcTransactionData,
  mempoolApi,
  rbf,
  RecommendedFeeResponse,
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

export type RbfRecommendedFees = {
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

const useRbfTransactionData = (transaction?: BtcTransactionData): RbfData => {
  const [isLoading, setIsLoading] = useState(true);
  const [rbfData, setRbfData] = useState<RbfData>({});
  const { accountType, network, selectedAccount } = useWalletSelector();
  const seedVault = useSeedVault();
  const btcClient = useBtcClient();

  const fetchRbfData = useCallback(async () => {
    if (!selectedAccount || !transaction) {
      setIsLoading(false);
      return;
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

      const rbfTransactionSummary = await rbf.getRbfTransactionSummary(btcClient, transaction.txid);

      const mempoolFees = await mempoolApi.getRecommendedFees(network.type);

      const rbfRecommendedFeesResponse = await rbfTx.getRbfRecommendedFees(mempoolFees);

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
