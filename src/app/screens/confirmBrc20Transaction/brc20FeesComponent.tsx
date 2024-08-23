import { StyledFiatAmountText } from '@components/fiatAmountText';
import { type SupportedCurrency } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const TextLabel = styled.label`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_0};
`;

const TextValue = styled.p`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_0};
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.m};
`;

const RowItem = styled.div`
  display: flex;
  justify-content: space-between;
`;

const FeeRateText = styled.p`
  ${(props) => props.theme.typography.body_medium_s}
  color: ${(props) => props.theme.colors.white_400};
  display: flex;
  justify-content: flex-end;
  margin-top: ${(props) => props.theme.space.xxs};
`;

const FiatAmountText = styled(StyledFiatAmountText)`
  display: flex;
  justify-content: flex-end;
`;

type Props = {
  label: string;
  value: BigNumber;
  suffix: string;
  fiatValue?: BigNumber;
  fiatCurrency?: SupportedCurrency;
  feeRate?: number;
};

function Brc20FeesComponent({ label, value, suffix, fiatValue, fiatCurrency, feeRate }: Props) {
  return (
    <Rows>
      <div>
        <RowItem>
          <TextLabel>{label}</TextLabel>
          <TextValue>
            <NumericFormat
              data-testid="brc20-fee"
              value={value.toString()}
              displayType="text"
              thousandSeparator
              suffix={` ${suffix}`}
            />
          </TextValue>
        </RowItem>
        {feeRate && (
          <FeeRateText>
            <NumericFormat value={feeRate.toString()} displayType="text" suffix=" sats/vB" />
          </FeeRateText>
        )}
        {fiatValue && fiatCurrency && (
          <FiatAmountText fiatAmount={fiatValue} fiatCurrency={fiatCurrency} />
        )}
      </div>
    </Rows>
  );
}

export default Brc20FeesComponent;
