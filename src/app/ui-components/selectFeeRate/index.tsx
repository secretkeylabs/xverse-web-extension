import { Pencil } from '@phosphor-icons/react';
import { currencySymbolMap } from '@secretkeylabs/xverse-core';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div`
  margin: ${(props) => props.theme.spacing(12)}px 0;
`;

const RowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.span<{
  $size: 'm' | 's';
  $variant: 'action' | 'light' | 'mid' | 'dark';
  $clickable?: boolean;
}>`
  ${(props) =>
    props.$size === 'm'
      ? props.theme.typography.body_medium_m
      : props.theme.typography.body_medium_s};
  color: ${(props) =>
    props.$variant === 'action'
      ? props.theme.colors.tangerine
      : props.$variant === 'light'
      ? props.theme.colors.white_0
      : props.$variant === 'mid'
      ? props.theme.colors.white_200
      : props.theme.colors.white_400};
  margin-bottom: ${(props) => props.theme.spacing(2)}px;
  cursor: ${(props) => (props.$clickable ? 'pointer' : 'default')};
`;

type Props = {
  fee: string | undefined;
  feeUnits: string;
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  feeRateUnits: string;
  fiatUnit: string;
  baseToFiat: (base: string) => string;
  getFeeForFeeRate: (feeRate: number) => Promise<number>;
  isLoading?: boolean;
};

function SelectFeeRate({
  fee,
  feeUnits,
  feeRate,
  feeRateUnits,
  fiatUnit,
  baseToFiat,
  setFeeRate,
  getFeeForFeeRate,
  isLoading,
}: Props) {
  return (
    <Container>
      <RowContainer>
        <Label $size="m" $variant="mid">
          Network Fee
        </Label>
        <NumericFormat
          value={fee}
          displayType="text"
          thousandSeparator
          renderText={(value: string) => (
            <Label $size="m" $variant="light">
              {value} {feeUnits}
            </Label>
          )}
        />
      </RowContainer>
      <RowContainer>
        <div>
          <Label $size="m" $variant="dark">
            Medium{' '}
          </Label>
          <Label $size="m" $variant="action" $clickable={!isLoading}>
            Edit <Pencil />
          </Label>
        </div>
        <Label $size="s" $variant="dark">
          {feeRate} {feeRateUnits}
        </Label>
      </RowContainer>
      {fee && (
        <RowContainer>
          <div />
          <NumericFormat
            value={baseToFiat(fee)}
            displayType="text"
            prefix={`~${currencySymbolMap[fiatUnit]}`}
            thousandSeparator
            renderText={(value: string) => (
              <Label $size="s" $variant="dark">
                {value} {fiatUnit}
              </Label>
            )}
          />
        </RowContainer>
      )}
    </Container>
  );
}

export default SelectFeeRate;
