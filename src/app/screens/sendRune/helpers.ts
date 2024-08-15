import { btcTransaction, runesTransaction } from '@secretkeylabs/xverse-core';

export type TransactionSummary = btcTransaction.TransactionSummary & {
  dustFiltered?: boolean;
};

type TransactionBuildPayload = {
  transaction: btcTransaction.EnhancedTransaction;
  summary?: TransactionSummary;
};

export const generateTransaction = async (
  transactionContext: btcTransaction.TransactionContext,
  tokenName: string,
  toAddress: string,
  amount: bigint,
  feeRate: number,
): Promise<TransactionBuildPayload> => {
  const transaction = await runesTransaction.sendManyRunes(
    transactionContext,
    [
      {
        runeName: tokenName,
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
