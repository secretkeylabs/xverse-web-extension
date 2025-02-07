import { type StacksTransactionWire } from '@stacks/transactions';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, ContentBodyContainer, ContentContainer } from '../../../../../../../../styles';
import { Actions } from '../shared/actions';
import { FeeEditor } from './components/feeEditor';
import { Header } from './components/header';
import { TransactionDetails } from './components/transactionDetails';
import { useRender } from './hooks';

type ReviewProps = {
  transactions: StacksTransactionWire[];
  onSuccess: () => void;
  onCancel: () => void;
};

export function Review({ onCancel, onSuccess, transactions }: ReviewProps) {
  const [transactionIndex, setTransactionIndex] = useState(0);
  const [showFeeEditor, setShowFeeEditor] = useState(false);
  const render = useRender();
  const { t } = useTranslation();

  const numTransactions = transactions.length;

  const confirmTitle =
    numTransactions > 1
      ? t('CONFIRM_TRANSACTION.CONFIRM_ALL_other')
      : t('CONFIRM_TRANSACTION.CONFIRM');
  const cancelTitle = t('COMMON.CANCEL');

  const handlePrev = useCallback(() => {
    if (transactionIndex > 0) {
      setTransactionIndex((prev) => prev - 1);
    }
  }, [transactionIndex]);

  const handleNext = useCallback(() => {
    if (transactionIndex < numTransactions - 1) {
      setTransactionIndex((prev) => prev + 1);
    }
  }, [transactionIndex, numTransactions]);

  const transaction = transactions[transactionIndex];

  return (
    <Container>
      <ContentContainer>
        <Header
          handleNext={handleNext}
          handlePrev={handlePrev}
          numTransactions={numTransactions}
          transactionIndex={transactionIndex}
        />

        <ContentBodyContainer>
          <TransactionDetails
            transaction={transaction}
            onEditFee={() => setShowFeeEditor(true)}
            onEditNonce={() => {}}
          />
        </ContentBodyContainer>
      </ContentContainer>

      <Actions
        main={{ title: confirmTitle, onClick: onSuccess }}
        secondary={{ title: cancelTitle, onClick: onCancel }}
      />

      <FeeEditor
        isOpen={showFeeEditor}
        transaction={transaction}
        onClose={() => setShowFeeEditor(false)}
        onSetFee={(fee) => {
          transaction.setFee(fee);
          render();
        }}
      />
    </Container>
  );
}
