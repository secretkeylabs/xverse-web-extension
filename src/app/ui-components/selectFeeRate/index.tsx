import { PencilSimple } from '@phosphor-icons/react';
import { currencySymbolMap } from '@secretkeylabs/xverse-core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import FeeSelectPopup from './feeSelectPopup';

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
  gap: 2px;
`;

const EditRow = styled.span`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 7px;
`;

type Props = {
  fee: string | undefined;
  feeUnits: string;
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  feeRateUnits: string;
  fiatUnit: string;
  baseToFiat: (base: string) => string;
  getFeeForFeeRate: (feeRate: number) => Promise<number | undefined>;
  isLoading?: boolean;
  feeRates: {
    low?: number;
    medium?: number;
    high?: number;
  };
  feeRateLimits?: {
    min?: number;
    max?: number;
  };
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
}: Props) {
  const { t } = useTranslation('translation');
  const [editing, setEditing] = useState(false);

  const feeRateSpeed = useMemo(() => {
    if (feeRate) {
      if (feeRate === feeRates.high?.toString()) {
        return t('TRANSACTION_SETTING.PRIORITIES.HIGH');
      }
      if (feeRate === feeRates.medium?.toString()) {
        return t('TRANSACTION_SETTING.PRIORITIES.MEDIUM');
      }
      if (feeRate === feeRates.low?.toString()) {
        return t('TRANSACTION_SETTING.PRIORITIES.LOW');
      }
    }

    return t('TRANSACTION_SETTING.PRIORITIES.CUSTOM');
  }, [feeRates, feeRate]);

  return (
    <div>
      <RowContainer>
        <Label $size="m" $variant="mid">
          {t('TRANSACTION_SETTING.NETWORK_FEE')}
        </Label>
        <NumericFormat
          value={fee || '-'}
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
        <EditRow>
          <Label $size="m" $variant="dark">
            {feeRateSpeed}{' '}
          </Label>
          <Label
            $size="m"
            $variant="action"
            $clickable={!isLoading}
            onClick={() => setEditing((cur) => !cur)}
          >
            {t('COMMON.EDIT')} <PencilSimple size={16} weight="fill" />
          </Label>
        </EditRow>
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
      </RowContainer>
      {fee && (
        <RowContainer>
          <div />
          <NumericFormat
            value={baseToFiat(fee)}
            displayType="text"
            prefix={`~ ${currencySymbolMap[fiatUnit]}`}
            thousandSeparator
            renderText={(value: string) => (
              <Label $size="s" $variant="dark">
                {value} {fiatUnit}
              </Label>
            )}
          />
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
        />
      )}
    </div>
  );
}

export default SelectFeeRate;
