import { btcTransaction } from '@secretkeylabs/xverse-core';

export type TransactionSummary = btcTransaction.TransactionSummary & {
  dustFiltered?: boolean;
};

type TransactionBuildPayload = {
  transaction: btcTransaction.EnhancedTransaction;
  summary?: TransactionSummary;
};

export const generateTransaction = async (
  transactionContext: btcTransaction.TransactionContext,
  toAddress: string,
  amount: bigint,
  feeRate: number,
): Promise<TransactionBuildPayload> => {
  const transaction = await btcTransaction.sendBtc(
    transactionContext,
    [
      {
        toAddress,
        amount,
      },
    ],
    feeRate,
  );

  try {
    const summary = await transaction.getSummary();
    return { transaction, summary };
  } catch (e) {
    if (e instanceof Error && e.message.includes('Insufficient funds')) {
      return { transaction };
    }
    throw e;
  }
};

export const generateSendMaxTransaction = async (
  transactionContext: btcTransaction.TransactionContext,
  toAddress: string,
  feeRate: number,
): Promise<TransactionBuildPayload> => {
  const { transaction, dustFiltered } = await btcTransaction.sendMaxBtc(
    transactionContext,
    toAddress,
    feeRate,
  );

  try {
    const summary = await transaction.getSummary();
    return { transaction, summary: { ...summary, dustFiltered } };
  } catch (e) {
    if (e instanceof Error && e.message.includes('Insufficient funds')) {
      return { transaction };
    }
    throw e;
  }
};
