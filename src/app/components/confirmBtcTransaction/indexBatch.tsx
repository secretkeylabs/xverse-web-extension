import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  compileAggregatedSummary,
  compileUserTransactionSummary,
  parseSummaryForRunes,
  type AggregatedSummary,
  type BaseSummary,
  type btcTransaction,
  type UserTransactionSummary,
} from '@secretkeylabs/xverse-core';
import Callout from '@ui-library/callout';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { TxSummaryContext, type TxSummaryContextProps } from './hooks/useTxSummaryContext';
import TransactionSummary from './transactionSummary';

const SpacedCallout = styled(Callout)`
  margin-bottom: ${(props) => props.theme.space.m};
`;

type Props = {
  summaries: {
    extractedSummary: UserTransactionSummary | AggregatedSummary;
    summary: btcTransaction.PsbtSummary;
  }[];
  isDuplicateTxs?: boolean;
};

function ConfirmBatchBtcTransactions({ summaries, isDuplicateTxs }: Props) {
  const txnContext = useTransactionContext();
  const { network } = useWalletSelector();

  const [aggregatedParsedTxSummaryContext, setAggregatedParsedTxSummaryContext] =
    useState<TxSummaryContextProps>();

  useEffect(() => {
    const summariesToAggregate = isDuplicateTxs && summaries.length ? [summaries[0]] : summaries;
    (async () => {
      const summary: btcTransaction.PsbtSummary = {
        inputs: summariesToAggregate.map((psbt) => psbt.summary.inputs).flat(),
        outputs: summariesToAggregate.map((psbt) => psbt.summary.outputs).flat(),
        feeOutput: undefined,
        isFinal: summariesToAggregate.reduce(
          (acc, curr) => acc && curr.extractedSummary.isFinal,
          true,
        ),
        hasSigHashNone: summariesToAggregate.some((psbt) => psbt.extractedSummary.hasSigHashNone),
        hasSigHashSingle: summariesToAggregate.some(
          (psbt) => psbt.extractedSummary.hasSigHashSingle,
        ),
      };
      const runeSummary = await parseSummaryForRunes(txnContext, summary, network.type);
      const base: BaseSummary = {
        runes: {
          mint: undefined,
          burns: summariesToAggregate.map((psbt) => psbt.extractedSummary.runes.burns).flat(),
          hasCenotaph: summariesToAggregate.some((psbt) => psbt.extractedSummary.runes.hasCenotaph),
          hasInvalidMint: summariesToAggregate.some(
            (psbt) => psbt.extractedSummary.runes.hasInvalidMint,
          ),
          hasInsufficientBalance: summariesToAggregate.some(
            (psbt) => psbt.extractedSummary.runes.hasInsufficientBalance,
          ),
        },
        inputs: summary.inputs,
        outputs: summary.outputs,
        feeRate: summary.feeRate,
        isFinal: summary.isFinal,
        hasSigHashNone: summary.hasSigHashNone,
        hasSigHashSingle: summary.hasSigHashSingle,
        hasExternalInputs: summariesToAggregate.some(
          (psbt) => psbt.extractedSummary.hasExternalInputs,
        ),
        hasOutputScript: summariesToAggregate.some((psbt) => psbt.extractedSummary.hasOutputScript),
        hasUnconfirmedInputs: summariesToAggregate.some(
          (psbt) => psbt.extractedSummary.hasUnconfirmedInputs,
        ),
      };

      setAggregatedParsedTxSummaryContext({
        extractedTxSummary:
          base.isFinal && !base.hasExternalInputs
            ? compileUserTransactionSummary(txnContext, summary, runeSummary, base)
            : compileAggregatedSummary(txnContext, summary, runeSummary, base),
        batchMintDetails: summaries.map((psbt) => psbt.extractedSummary.runes.mint).flat(),
      });
    })();
  }, [summaries, txnContext, network.type, isDuplicateTxs]);

  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  if (aggregatedParsedTxSummaryContext?.extractedTxSummary) {
    const { hasSigHashNone } = aggregatedParsedTxSummaryContext.extractedTxSummary;

    return (
      <TxSummaryContext.Provider value={aggregatedParsedTxSummaryContext}>
        {/* TODO: add sighash single warning */}
        {hasSigHashNone && (
          <SpacedCallout
            variant="danger"
            titleText={t('PSBT_SIG_HASH_NONE_DISCLAIMER_TITLE')}
            bodyText={t('PSBT_SIG_HASH_NONE_DISCLAIMER')}
          />
        )}
        <TransactionSummary isSubmitting={false} hideDetails />
      </TxSummaryContext.Provider>
    );
  }
}

export default ConfirmBatchBtcTransactions;
