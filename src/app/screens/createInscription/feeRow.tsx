import { currencySymbolMap } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import {
  CardRow,
  NumberSuffix,
  NumberWithSuffixContainer,
  Pill,
  StyledPillLabel,
} from './index.styled';

export const SATS_PER_BTC = 100e6;

type Props = {
  label: string;
  subLabel?: string;
  value?: number | string | null;
  fiatCurrency: string;
  fiatRate: string;
  repeat?: number;
};

function FeeRow({ label, subLabel, value = 0, fiatCurrency, fiatRate, repeat }: Props) {
  if (!value) {
    return null;
  }
  const fiatValue = BigNumber(value || 0)
    .dividedBy(SATS_PER_BTC)
    .multipliedBy(fiatRate)
    .toFixed(2);

  return (
    <CardRow>
      <div>
        <StyledPillLabel>
          {label}
          {repeat && <Pill>{`x${repeat}`}</Pill>}
        </StyledPillLabel>
        {!!subLabel && <NumberSuffix>{subLabel}</NumberSuffix>}
      </div>
      <NumberWithSuffixContainer>
        <NumericFormat value={value} displayType="text" thousandSeparator suffix=" sats" />
        <NumericFormat
          value={fiatValue}
          displayType="text"
          thousandSeparator
          prefix={`~ ${currencySymbolMap[fiatCurrency]}`}
          suffix={` ${fiatCurrency}`}
          renderText={(val: string) => <NumberSuffix>{val}</NumberSuffix>}
        />
      </NumberWithSuffixContainer>
    </CardRow>
  );
}

export default FeeRow;
