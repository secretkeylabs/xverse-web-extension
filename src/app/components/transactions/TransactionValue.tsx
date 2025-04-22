import { HIDDEN_BALANCE_LABEL } from '@utils/constants';
import styled from 'styled-components';
import Theme, { type Color } from 'theme';

const StyledP = styled.p<{ $color: string }>`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.$color};
`;

type Props = {
  hidden?: boolean;
  amount?: string;
  unit?: string;
  customColor?: Color;
  hidePrefix?: boolean;
};

function TransactionValue({ hidden, amount, unit, customColor, hidePrefix }: Props) {
  if (hidden) {
    return <StyledP $color={Theme.colors.white_0}>{HIDDEN_BALANCE_LABEL}</StyledP>;
  }

  const isDebit = amount?.match('-');
  const color = customColor
    ? Theme.colors[customColor]
    : isDebit || hidePrefix
    ? Theme.colors.white_0
    : Theme.colors.success_light;
  const prefix = !isDebit ? '+' : '';

  return <StyledP $color={color}>{`${hidePrefix ? '' : prefix}${amount} ${unit || ''}`}</StyledP>;
}

export { TransactionValue };
