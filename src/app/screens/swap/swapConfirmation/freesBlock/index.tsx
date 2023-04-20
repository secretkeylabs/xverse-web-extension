import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Container, TitleText } from '@screens/swap/swapConfirmation/stxInfoBlock';
import { EstimateUSDText } from '@screens/swap/swapTokenBlock';

const RowContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const FeeText = styled.p((props) => ({
  ...props.theme.body_m,
  fontSize: 14,
  fontWeight: 500,
}));

interface FeeTextProps {
  fee: number;
  currency: string;
}

export default function FeesBlock({ fee, currency }: FeeTextProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_CONFIRM_SCREEN' });
  return (
    <Container>
      <RowContainer>
        <TitleText>{t('FEES')}</TitleText>
        <FeeText>{`${fee.toString()} ${currency}`}</FeeText>
      </RowContainer>
      <EstimateUSDText>{` ~ $${0.45} USD`}</EstimateUSDText>
    </Container>
  );
}
