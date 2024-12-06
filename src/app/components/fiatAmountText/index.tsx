import { currencySymbolMap, type SupportedCurrency } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

type Props = {
  className?: string;
  fiatAmount?: BigNumber;
  fiatCurrency: SupportedCurrency;
  dataTestId?: string;
};

function FiatAmountText({ className, fiatAmount, fiatCurrency, dataTestId }: Props) {
  if (!fiatAmount || !fiatCurrency) {
    return null;
  }

  if (fiatAmount.isEqualTo(0)) {
    return (
      <span className={className}>{`${currencySymbolMap[fiatCurrency]}0.00 ${fiatCurrency}`}</span>
    );
  }

  if (fiatAmount.isLessThan(0.01)) {
    return (
      <span
        className={className}
      >{`< ${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`}</span>
    );
  }
  return (
    <NumericFormat
      className={className}
      value={fiatAmount.toFixed(2).toString()}
      displayType="text"
      thousandSeparator
      prefix={` ${currencySymbolMap[fiatCurrency]}`}
      suffix={` ${fiatCurrency}`}
      data-testid={dataTestId}
    />
  );
}

export const StyledFiatAmountText = styled(FiatAmountText)`
  ${(props) => props.theme.typography.body_medium_s}
  color: ${(props) => props.theme.colors.white_400};
`;

export const RightAlignedStyledFiatAmountText = styled(StyledFiatAmountText)`
  text-align: right;
  flex: 1 0 auto;
`;

export default FiatAmountText;
