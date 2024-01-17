import { Bicycle, CarProfile, RocketLaunch } from '@phosphor-icons/react';
import { currencySymbolMap } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Spinner from '@ui-library/spinner';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled, { useTheme } from 'styled-components';

interface FeeContainer {
  isSelected: boolean;
}

const FeeItemContainer = styled.button<FeeContainer>`
  display: flex;
  padding: ${(props) => props.theme.space.s} ${(props) => props.theme.space.m};
  align-items: center;
  gap: ${(props) => props.theme.space.s};
  align-self: stretch;
  border-radius: ${(props) => props.theme.space.s};
  border: 1px solid ${(props) => props.theme.colors.elevation6};
  flex-direction: row;
  background: ${(props) => (props.isSelected ? props.theme.colors.elevation6_600 : 'transparent')};
  margin-top: ${(props) => props.theme.space.xs};
  flex: 1;
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

const StyledSubText = styled(StyledP)`
  margin-bottom: ${(props) => props.theme.space.xxs};
`;

const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`;

type FeePriority = 'high' | 'medium' | 'low';

const priorityTimeMap: Record<FeePriority, number> = {
  high: 10,
  medium: 30,
  low: 60,
};

interface FeeItemProps {
  priority: FeePriority;
  time?: string;
  feeRate: number;
  feeUnits: string;
  feeRateUnits: string;
  fiatUnit: string;
  baseToFiat: (base: string) => string;
  getFeeForFeeRate: (feeRate: number) => Promise<number | undefined>;
  selected: boolean;
  onClick?: () => void;
}

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
}: FeeItemProps) {
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
  }, [feeRate, getFeeForFeeRate, baseToFiat]);

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

  return (
    <FeeItemContainer onClick={onClick} isSelected={selected} disabled={!totalFee}>
      <IconContainer>{getIcon()}</IconContainer>
      <TextsContainer>
        <ColumnsTexts>
          <StyledHeading typography="body_medium_m" color={mainColor}>
            {getLabel()}
          </StyledHeading>
          <StyledSubText typography="body_medium_s" color={secondaryColor}>
            {time ?? `~${priorityTimeMap[priority]} mins`}
          </StyledSubText>
          <StyledP
            typography="body_medium_s"
            color={secondaryColor}
          >{`${feeRate} ${feeRateUnits}`}</StyledP>
        </ColumnsTexts>
        {!isLoading ? (
          <EndColumnTexts $insufficientFunds={totalFee === undefined}>
            <StyledHeading typography="body_medium_m" color={mainColor}>
              {`${totalFee || '-'} ${feeUnits}`}
            </StyledHeading>
            {fiat && (
              <StyledP typography="body_medium_s" color={secondaryColor}>
                <NumericFormat
                  value={fiat}
                  displayType="text"
                  prefix={`~${currencySymbolMap[fiatUnit]}`}
                  thousandSeparator
                  renderText={(value: string) => `${value} ${fiatUnit}`}
                />
              </StyledP>
            )}
            {!totalFee && (
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
