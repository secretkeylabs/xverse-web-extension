import useWalletSelector from '@hooks/useWalletSelector';
import { Container, TitleText } from '@screens/swap/swapConfirmation/stxInfoBlock';
import { EstimateUSDText } from '@screens/swap/swapTokenBlock';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const RowContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const FeeText = styled.p((props) => ({
  ...props.theme.body_m,
  fontSize: 14,
  fontWeight: 500,
}));

interface FeeTextProps {
  txFee: number;
  txFeeFiatAmount?: number;
}

export default function FeesBlock({ txFee, txFeeFiatAmount }: FeeTextProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_CONFIRM_SCREEN' });
  const { fiatCurrency } = useWalletSelector();
  return (
    <Container>
      <RowContainer>
        <TitleText>{t('FEES')}</TitleText>
        <FeeText>{`${txFee.toFixed(6)} STX`}</FeeText>
      </RowContainer>
      <EstimateUSDText>{` ~ ${currencySymbolMap[fiatCurrency]} ${txFeeFiatAmount} ${fiatCurrency}`}</EstimateUSDText>
    </Container>
  );
}
