/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-restricted-syntax */
import ledgerConnectDefaultIcon from '@assets/img/hw/ledger/ledger_connect_default.svg';
import { signLedgerStxTransaction } from '@secretkeylabs/xverse-core';
import type { StacksTransactionWire } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Transport } from '../types';
import { Layout } from './connectLedger/components/shared/layout';

type SigningTransactionsProps = {
  transactions: StacksTransactionWire[];
  accountIndex: number;
  transport: Transport;
  onSuccess: (signedTransactions: StacksTransactionWire[]) => void;
  onError: (error: Error) => void;
};
export function SigningTransactions({
  transactions,
  transport,
  accountIndex: deviceAccountIndex,
  onSuccess,
  onError,
}: SigningTransactionsProps) {
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ transport }: { transport: Transport }) => {
      const signedTransactions: StacksTransactionWire[] = [];
      for (const [index, transaction] of transactions.entries()) {
        setCurrentTransactionIndex(index);
        const signedTransaction = await signLedgerStxTransaction({
          transport,
          // TODO: Remove `Buffer` when xverse-core has been updated to `@stacks.js/*` v7
          transactionBuffer: Buffer.from(transaction.serializeBytes()),
          addressIndex: deviceAccountIndex,
        });
        signedTransactions.push(signedTransaction);
      }
      return signedTransactions;
    },
    onSuccess,
    onError,
  });
  useEffect(() => {
    if (isPending) return;
    mutate({ transport });
  }, [mutate, isPending, transport]);
  const { t } = useTranslation();

  const totalTransactions = transactions.length;
  const title = useMemo(() => {
    if (totalTransactions === 1) return t('CONFIRM_TRANSACTION.LEDGER.CONFIRM.TITLE');
    return t('CONFIRM_TRANSACTION.LEDGER.CONFIRM.TITLE_MULTIPLE', {
      current: currentTransactionIndex + 1,
      total: totalTransactions,
    });
  }, [currentTransactionIndex, totalTransactions, t]);
  const subtitle = t('CONFIRM_TRANSACTION.LEDGER.CONFIRM.SUBTITLE');

  return (
    <Layout
      image={{ src: ledgerConnectDefaultIcon, alt: t('LEDGER_CONNECT.ALT.DEFAULT_ALT') }}
      title={title}
      subtitle={subtitle}
    />
  );
}
