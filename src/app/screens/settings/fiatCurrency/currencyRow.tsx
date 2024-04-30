import TickIcon from '@assets/img/settings/tick.svg';
import type { SupportedCurrency } from '@secretkeylabs/xverse-core';
import { Currency } from '@utils/currency';
import styled, { useTheme } from 'styled-components';

interface TitleProps {
  color: string;
}

interface ButtonProps {
  border: string;
}

const Button = styled.button<ButtonProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  background: 'transparent',
  justifyContent: 'flex-start',
  paddingBottom: props.theme.spacing(10),
  paddingTop: props.theme.spacing(10),
  borderBottom: props.border,
}));

const Text = styled.h1<TitleProps>((props) => ({
  ...props.theme.body_medium_m,
  color: props.color,
  flex: 1,
  textAlign: 'left',
  marginLeft: props.theme.spacing(6),
}));

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
      border={showDivider ? '1px solid rgb(76,81,135,0.3)' : 'transparent'}
    >
      <img src={currency.flag} alt="flag" />
      <Text color={isSelected ? theme.colors.white_0 : 'rgb(255,255,255,0.6)'}>
        {currency.name}
      </Text>
      {isSelected && <img src={TickIcon} alt="tick" />}
    </Button>
  );
}

export default CurrencyRow;
