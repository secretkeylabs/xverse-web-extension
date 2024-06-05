import TickIcon from '@assets/img/settings/tick.svg';
import type { SupportedCurrency } from '@secretkeylabs/xverse-core';
import { Currency } from '@utils/currency';
import styled, { useTheme } from 'styled-components';

const Button = styled.button<{
  $border: string;
  $color: string;
}>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.$color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${props.theme.space.m} 0`,
  backgroundColor: 'transparent',
  borderBottom: props.$border,
  transition: 'color 0.1s ease',
  '&:hover': {
    color: props.theme.colors.white_200,
  },
}));

const CurrencyWrapper = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  columnGap: props.theme.space.s,
}));

const StyledImg = styled.img({
  width: 21,
});

interface Props {
  currency: Currency;
  isSelected: boolean;
  onCurrencySelected: (abbr: SupportedCurrency) => void;
  showDivider: boolean;
}

function CurrencyRow({ currency, isSelected, onCurrencySelected, showDivider }: Props) {
  const theme = useTheme();
  const onClick = () => {
    onCurrencySelected(currency.name);
  };

  return (
    <Button
      data-testid="currency-button"
      onClick={onClick}
      $border={showDivider ? `1px solid ${theme.colors.white_900}` : 'transparent'}
      $color={isSelected ? theme.colors.white_0 : theme.colors.white_400}
    >
      <CurrencyWrapper>
        <StyledImg src={currency.flag} alt="flag" />
        {currency.name}
      </CurrencyWrapper>
      {isSelected && <img src={TickIcon} alt="tick" />}
    </Button>
  );
}

export default CurrencyRow;
