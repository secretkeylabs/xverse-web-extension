import { StyledFiatAmountText } from '@components/fiatAmountText';
import { PencilSimple } from '@phosphor-icons/react';
import type { SupportedCurrency } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import FeeSelectPopup, { type FeePriority } from './feeSelectPopup';

const RowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.span<{
  $size: 'm' | 's';
  $variant: 'light' | 'dark';
}>`
  ${(props) =>
    props.$size === 'm'
      ? props.theme.typography.body_medium_m
      : props.theme.typography.body_medium_s};
  color: ${(props) =>
    props.$variant === 'light' ? props.theme.colors.white_0 : props.theme.colors.white_400};
  transition: color 0.1s ease;
  margin-bottom: ${(props) => props.theme.space.xxs};
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: ${(props) => props.theme.space.xxs};
`;

const EditButton = styled.button<{
  $clickable?: boolean;
}>`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.tangerine};
  background-color: transparent;
  transition: color 0.1s ease;
  margin-bottom: ${(props) => props.theme.space.xxs};
  cursor: ${(props) => (props.$clickable ? 'pointer' : 'default')};

  user-select: ${(props) => (props.$clickable ? 'none' : 'auto')};

  ${(props) =>
    props.$clickable &&
    `
  &:hover {
    color: ${props.theme.colors.tangerine_200};
  }`}

  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: ${(props) => props.theme.space.xxs};
`;

const EditRow = styled.span`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 7px;
`;

export type FeeRates = {
  low?: number;
  medium?: number;
  high?: number;
};

type Props = {
  fee: string | undefined;
  feeUnits: string;
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  feeRateUnits?: string;
  fiatUnit: string;
  baseToFiat: (base: string) => string;
  getFeeForFeeRate: (feeRate: number) => Promise<number | undefined>;
  isLoading?: boolean;
  feeRates: FeeRates;
  feeRateLimits?: {
    min?: number;
    max?: number;
  };
  absoluteBalance?: number;
  amount?: number;
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
  feeRates,
  feeRateLimits,
  isLoading,
  absoluteBalance,
  amount,
}: Props) {
  const { t } = useTranslation('translation');
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<FeePriority | 'custom' | null>(null);

  useEffect(() => {
    if (!feeRate || selected) return;

    const feeRateString = feeRate.toString();

    if (feeRateString === feeRates.high?.toString()) {
      setSelected('high');
    } else if (feeRateString === feeRates.medium?.toString()) {
      setSelected('medium');
    } else if (feeRateString === feeRates.low?.toString()) {
      setSelected('low');
    } else {
      setSelected('custom');
    }
  }, [feeRates, feeRate, selected]);

  let feeRateSpeed = '';

  if (selected) {
    feeRateSpeed = t(`TRANSACTION_SETTING.PRIORITIES.${selected.toUpperCase()}`);
  }
  return (
    <div>
      <RowContainer>
        <Label $size="m" $variant="light">
          {t('TRANSACTION_SETTING.NETWORK_FEE')}
        </Label>
        <NumericFormat
          value={fee || '-'}
          displayType="text"
          thousandSeparator
          renderText={(value: string) => (
            <Label data-testid="fee-amount" $size="m" $variant="light">
              {value} {feeUnits}
            </Label>
          )}
        />
      </RowContainer>
      <RowContainer>
        <EditRow>
          {feeRateSpeed && (
            <Label data-testid="fee-priority" $size="m" $variant="dark">
              {feeRateSpeed}{' '}
            </Label>
          )}
          <EditButton
            data-testid="fee-button"
            $clickable={!isLoading}
            onClick={() => setEditing((cur) => !cur)}
          >
            {t('COMMON.EDIT')} <PencilSimple size={16} weight="fill" />
          </EditButton>
        </EditRow>
        {/* Fee can either be an absolute amount or a rate */}
        {/* If feeRateUnits is not defined, therefore an absolute fee is used */}
        {feeRateUnits ? (
          <Label $size="s" $variant="dark">
            <NumericFormat
              value={feeRate}
              displayType="text"
              thousandSeparator
              renderText={(value: string) => (
                <>
                  {value} {feeRateUnits}
                </>
              )}
            />
          </Label>
        ) : (
          fee && (
            <StyledFiatAmountText
              fiatAmount={BigNumber(baseToFiat(fee))}
              fiatCurrency={fiatUnit as SupportedCurrency}
            />
          )
        )}
      </RowContainer>
      {/* add extra row if contain both feeRateUnits & fees */}
      {feeRateUnits && fee && (
        <RowContainer>
          <div />
          {fee && (
            <StyledFiatAmountText
              fiatAmount={BigNumber(baseToFiat(fee))}
              fiatCurrency={fiatUnit as SupportedCurrency}
            />
          )}
        </RowContainer>
      )}
      {editing && (
        <FeeSelectPopup
          currentFeeRate={feeRate}
          feeUnits={feeUnits}
          feeRateUnits={feeRateUnits}
          fiatUnit={fiatUnit}
          feeRates={feeRates}
          feeRateLimits={feeRateLimits}
          onClose={() => setEditing(false)}
          baseToFiat={baseToFiat}
          setFeeRate={setFeeRate}
          getFeeForFeeRate={getFeeForFeeRate}
          absoluteBalance={absoluteBalance}
          amount={amount}
          selected={selected}
          setSelected={setSelected}
        />
      )}
    </div>
  );
}

export default SelectFeeRate;
