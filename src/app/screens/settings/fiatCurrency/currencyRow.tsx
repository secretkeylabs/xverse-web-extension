import styled, { useTheme } from 'styled-components';
import TickIcon from '@assets/img/settings/tick.svg';
import { SupportedCurrency } from '@secretkeylabs/xverse-core/types';
import { Currency } from './helper';

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

function CurrencyRow({
  currency, isSelected, onCurrencySelected, showDivider,
}: Props) {
  const theme = useTheme();
  const showTick = (
    <img src={TickIcon} alt="tick" />
  );
  const onClick = () => {
    onCurrencySelected(currency.name);
  };
  return (
    <Button
      onClick={onClick}
      border={showDivider ? `1px solid ${theme.colors.background.elevation3}` : 'transparent'}
    >
      <img src={currency.flag} alt="flag" />
      <Text color={isSelected ? theme.colors.white['0'] : theme.colors.white['200']}>
        {currency.name}
      </Text>
      {isSelected && showTick}
    </Button>
  );
}

export default CurrencyRow;
