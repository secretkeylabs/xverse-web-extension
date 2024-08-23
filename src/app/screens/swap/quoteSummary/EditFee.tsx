import { PencilSimple } from '@phosphor-icons/react';
import type { FeePriority } from '@ui-components/selectFeeRate/feeSelectPopup';
import FeeSelectPopup from '@ui-components/selectFeeRate/feeSelectPopup';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const EditRow = styled.span`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 7px;
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
  transition: color 0.1s ease;
  margin-bottom: ${(props) => props.theme.space.xxs};
  cursor: ${(props) => (props.$clickable ? 'pointer' : 'default')};
  transition: color 0.1s ease;

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
  gap: ${(props) => props.theme.space.xxxs};
`;

type FeeRates = {
  low?: number;
  medium?: number;
  high?: number;
};

type Props = {
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  feeRateUnits?: string;
  feeUnits;
  fiatUnit: string;
  baseToFiat: (base: string) => string;
  getFeeForFeeRate: (feeRate: number) => Promise<number | undefined>;
  isLoading?: boolean;
  feeRates: FeeRates;
  feeRateLimits?: {
    min?: number;
    max?: number;
  };
  amount?: number;
  onFeeChange: (feeRate: string) => void;
};

function EditFee({
  feeRate,
  feeRateUnits,
  feeUnits,
  fiatUnit,
  baseToFiat,
  setFeeRate,
  getFeeForFeeRate,
  feeRates,
  feeRateLimits,
  isLoading,
  amount,
  onFeeChange,
}: Props) {
  const { t } = useTranslation('translation');
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<FeePriority | 'custom' | null>(null);

  useEffect(() => {
    if (feeRate) {
      if (feeRate === feeRates.high?.toString()) {
        if (!selected) {
          setSelected('high');
        }
      }
      if (feeRate === feeRates.medium?.toString()) {
        if (!selected) {
          setSelected('medium');
        }
      }
      if (feeRate === feeRates.low?.toString()) {
        if (!selected) {
          setSelected('low');
        }
      }
    }
  }, [feeRates, feeRate, selected]);

  const handleFeeChange = (newFeeRate: string) => {
    setFeeRate(newFeeRate);
    onFeeChange(newFeeRate);
  };

  return (
    <div>
      <EditRow>
        <Label
          data-testid="fee-button"
          $size="m"
          $variant="action"
          $clickable={!isLoading}
          onClick={() => setEditing((cur) => !cur)}
        >
          {t('COMMON.EDIT')} <PencilSimple size={16} weight="fill" />
        </Label>
      </EditRow>
      {editing && (
        <FeeSelectPopup
          currentFeeRate={feeRate}
          feeRateUnits={feeRateUnits}
          fiatUnit={fiatUnit}
          feeUnits={feeUnits}
          feeRates={feeRates}
          feeRateLimits={feeRateLimits}
          onClose={() => setEditing(false)}
          baseToFiat={baseToFiat}
          setFeeRate={handleFeeChange}
          getFeeForFeeRate={getFeeForFeeRate}
          amount={amount}
          selected={selected}
          setSelected={setSelected}
        />
      )}
    </div>
  );
}

export default EditFee;
