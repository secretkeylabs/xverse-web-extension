import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Controls } from '../../../../../../../../controls';

const Container = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});
const Heading = styled.div(({ theme }) => ({
  ...theme.typography.headline_xs,
}));

type Props = {
  transactionIndex: number;
  numTransactions: number;
  handlePrev: () => void;
  handleNext: () => void;
};

export function Header({ transactionIndex, numTransactions, handleNext, handlePrev }: Props) {
  const { t } = useTranslation();

  const step = transactionIndex + 1;
  const totalSteps = numTransactions;

  if (numTransactions <= 1) return <Heading>{t('CONFIRM_TRANSACTION.REVIEW_TRANSACTION')}</Heading>;

  return (
    <Container>
      <Heading>
        {t('COMMON.TRANSACTION')} {step}/{totalSteps}
      </Heading>
      <Controls
        currentIndex={transactionIndex}
        totalElements={numTransactions}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </Container>
  );
}
