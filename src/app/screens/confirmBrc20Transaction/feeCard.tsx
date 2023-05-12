import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.background.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  justifyContent: 'center',
  marginBottom: 12,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
}));
const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 16,
});

const ValueText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

interface Props {
  inscriptionFee: BigNumber;
  transactionFee: BigNumber;
  totalFee: BigNumber;
}
function FeeCard({ inscriptionFee, transactionFee, totalFee }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  return (
    <Container>
      <TitleText>Fees</TitleText>
      <RowContainer>
        <TitleText>{t('INSCRIPTION_FEES')}</TitleText>
        <ValueText>{`${inscriptionFee} ${t('SATS')}`}</ValueText>
      </RowContainer>
      <RowContainer>
        <TitleText>{t('TRANSACTION_FEES')}</TitleText>
        <ValueText>{`${transactionFee} ${t('SATS')}`}</ValueText>
      </RowContainer>
      <RowContainer>
        <TitleText>{t('TOTAL_FEES')}</TitleText>
        <ValueText>{`${totalFee} ${t('SATS')}`}</ValueText>
      </RowContainer>
    </Container>
  );
}

export default FeeCard;
