import styled from 'styled-components';
import { NumericFormat } from 'react-number-format';
import { useTranslation } from 'react-i18next';
import { ArrowsDownUp } from '@phosphor-icons/react';

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const SubText = styled.h1((props) => ({
  ...props.theme.body_xs,
  display: 'flex',
  flex: 1,
  color: props.theme.colors.white_400,
}));

const SwitchToFiatButton = styled.button((props) => ({
  backgroundColor: props.theme.colors.background.elevation0,
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  borderRadius: 24,
  display: 'flex',
  padding: '8px 12px',
  justifyContent: 'center',
  alignItems: 'center',
  color: props.theme.colors.white_0,
}));

const SwitchToFiatText = styled.h1((props) => ({
  ...props.theme.body_xs,
  marginLeft: props.theme.spacing(2),
  color: props.theme.colors.white_0,
}));

export function FiatRow({
  onClick,
  showFiat,
  tokenCurrency,
  tokenAmount,
  fiatCurrency,
  fiatAmount,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  showFiat: boolean;
  tokenCurrency: string;
  tokenAmount: string;
  fiatCurrency: string;
  fiatAmount: string;
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const renderText = (value: string) => `~ ${value} ${tokenCurrency}`;
  return (
    <RowContainer>
      <SubText>
        {showFiat ? (
          <NumericFormat
            value={tokenAmount}
            displayType="text"
            thousandSeparator
            renderText={renderText}
          />
        ) : (
          `~ $ ${fiatAmount} ${fiatCurrency}`
        )}
      </SubText>
      <SwitchToFiatButton onClick={onClick}>
        <ArrowsDownUp size={12} color="currentColor" />
        <SwitchToFiatText>
          {showFiat ? `${t('SWITCH_TO')} ${tokenCurrency}` : `${t('SWITCH_TO')} ${fiatCurrency}`}
        </SwitchToFiatText>
      </SwitchToFiatButton>
    </RowContainer>
  );
}
export default FiatRow;
