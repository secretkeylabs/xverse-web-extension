import FiatAmountText from '@components/fiatAmountText';
import { Bicycle, CarProfile, RocketLaunch } from '@phosphor-icons/react';
import type { SupportedCurrency } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Spinner from '@ui-library/spinner';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

export const FeeItemContainer = styled.button<{
  $isSelected: boolean;
  $insufficientFunds?: boolean;
}>`
  display: flex;
  padding: ${(props) => props.theme.space.s} ${(props) => props.theme.space.m};
  align-items: center;
  gap: ${(props) => props.theme.space.s};
  align-self: stretch;
  border-radius: ${(props) => props.theme.space.s};
  border: 1px solid ${(props) => props.theme.colors.white_850};
  flex-direction: row;
  flex: 1;
  background-color: ${(props) =>
    props.$isSelected ? props.theme.colors.elevation6_600 : 'transparent'};
  transition: background-color 0.1s ease;

  ${(props) => props.$insufficientFunds && 'cursor: not-allowed;'}

  &:hover:enabled {
    background-color: ${(props) => props.theme.colors.elevation6_400};
  }

  &:active:enabled {
    background-color: ${(props) => props.theme.colors.elevation6_600};
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  flex: 1;
`;

const ColumnsTexts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;
const EndColumnTexts = styled.div<{ $insufficientFunds?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: ${(props) => (props.$insufficientFunds ? 'space-between' : 'flex-start')};
`;

const StyledHeading = styled(StyledP)`
  margin-bottom: ${(props) => props.theme.space.xxs};
`;

const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`;

const StyledFiatAmountText = styled(FiatAmountText)<{ $color: string }>`
  ${(props) => props.theme.typography.body_medium_s}
  color: ${(props) => props.theme.colors[props.$color]};
`;

type FeePriority = 'high' | 'medium' | 'low';

const priorityTimeMap: Record<FeePriority, number> = {
  high: 10,
  medium: 30,
  low: 60,
};

type Props = {
  priority: FeePriority;
  time?: string;
  feeRate: number;
  feeUnits: string;
  feeRateUnits?: string;
  fiatUnit: string;
  baseToFiat: (base: string) => string;
  getFeeForFeeRate: (feeRate: number) => Promise<number | undefined>;
  selected: boolean;
  onClick?: () => void;
  absoluteBalance?: number;
  amount?: number;
};

function FeeItem({
  priority,
  time,
  feeRate,
  feeUnits,
  feeRateUnits,
  fiatUnit,
  baseToFiat,
  getFeeForFeeRate,
  selected,
  onClick,
  absoluteBalance,
  amount,
}: Props) {
  const { t } = useTranslation('translation');
  const theme = useTheme();

  const [totalFee, setTotalFee] = useState<number | undefined>(undefined);
  const [fiat, setFiat] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    const getFee = async () => {
      try {
        const fee = await getFeeForFeeRate(feeRate);
        if (fee !== undefined) {
          setTotalFee(fee);
          setFiat(baseToFiat(fee.toString()));
        }
      } finally {
        setIsLoading(false);
      }
    };

    getFee();
  }, [feeRate]);

  const getIcon = () => {
    const color = totalFee ? theme.colors.tangerine : theme.colors.white_600;
    switch (priority) {
      case 'high':
        return <RocketLaunch size={20} color={color} />;
      case 'low':
        return <Bicycle size={20} color={color} />;
      case 'medium':
      default:
        return <CarProfile size={20} color={color} />;
    }
  };

  const getLabel = () => {
    switch (priority) {
      case 'high':
        return t('SPEED_UP_TRANSACTION.HIGH_PRIORITY');
      case 'medium':
        return t('SPEED_UP_TRANSACTION.MED_PRIORITY');
      case 'low':
      default:
        return t('SPEED_UP_TRANSACTION.LOW_PRIORITY');
    }
  };

  const mainColor = totalFee ? 'white_0' : 'white_400';
  const secondaryColor = totalFee ? 'white_200' : 'white_400';

  const feesExceedBalance = Boolean(
    totalFee && absoluteBalance && absoluteBalance + Number(amount ?? 0) < Number(totalFee),
  );
  const insufficientFunds = totalFee === undefined || feesExceedBalance;

  return (
    <FeeItemContainer
      data-testid="fee-select-button"
      onClick={onClick}
      $isSelected={selected}
      disabled={!totalFee || feesExceedBalance}
      $insufficientFunds={insufficientFunds}
    >
      <IconContainer>{getIcon()}</IconContainer>
      <TextsContainer>
        <ColumnsTexts>
          <StyledHeading typography="body_medium_m" color={mainColor}>
            {getLabel()}
          </StyledHeading>
          <StyledP typography="body_medium_s" color={secondaryColor}>
            {time ?? `~${priorityTimeMap[priority]} mins`}
          </StyledP>
          {feeRateUnits && (
            <StyledP
              typography="body_medium_s"
              color={secondaryColor}
            >{`${feeRate} ${feeRateUnits}`}</StyledP>
          )}
        </ColumnsTexts>
        {!isLoading ? (
          <EndColumnTexts $insufficientFunds={insufficientFunds}>
            <StyledHeading data-testid="total-fee" typography="body_medium_m" color={mainColor}>
              {`${totalFee || '-'} ${feeUnits}`}
            </StyledHeading>
            {totalFee !== undefined && (
              <StyledFiatAmountText
                $color={secondaryColor}
                fiatAmount={fiat ? BigNumber(fiat) : undefined}
                fiatCurrency={fiatUnit as SupportedCurrency}
              />
            )}
            {(!totalFee || feesExceedBalance) && (
              <StyledP typography="body_medium_s" color="danger_light">
                {t('SEND.INSUFFICIENT_FUNDS')}
              </StyledP>
            )}
          </EndColumnTexts>
        ) : (
          <LoaderContainer>
            <Spinner size={20} />
          </LoaderContainer>
        )}
      </TextsContainer>
    </FeeItemContainer>
  );
}

export default FeeItem;
