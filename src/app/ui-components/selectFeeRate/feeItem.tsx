import { Bicycle, CarProfile, RocketLaunch } from '@phosphor-icons/react';
import { currencySymbolMap } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';
import Theme from 'theme';

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
const EndColumnTexts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const StyledHeading = styled(StyledP)`
  margin-bottom: ${(props) => props.theme.space.xxs};
`;

const StyledSubText = styled(StyledP)`
  color: ${(props) => props.theme.colors.white_200};
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
  getFeeForFeeRate: (feeRate: number) => Promise<number>;
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

  const [totalFee, setTotalFee] = useState<number | undefined>(undefined);
  const [fiat, setFiat] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getFee = async () => {
      const fee = await getFeeForFeeRate(feeRate);
      setTotalFee(fee);
      setFiat(baseToFiat(fee.toString()));
    };

    getFee();
  }, [feeRate, getFeeForFeeRate, baseToFiat]);

  const getIcon = () => {
    switch (priority) {
      case 'high':
        return <RocketLaunch size={20} color={Theme.colors.tangerine} />;
      case 'low':
        return <Bicycle size={20} color={Theme.colors.tangerine} />;
      case 'medium':
      default:
        return <CarProfile size={20} color={Theme.colors.tangerine} />;
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

  return (
    <FeeItemContainer onClick={onClick} isSelected={selected} disabled={!totalFee}>
      <IconContainer>{getIcon()}</IconContainer>
      <TextsContainer>
        <ColumnsTexts>
          <StyledHeading typography="body_medium_m" color="white_0">
            {getLabel()}
          </StyledHeading>
          <StyledSubText typography="body_medium_s">
            {time ?? `~${priorityTimeMap[priority]} mins`}
          </StyledSubText>
          <StyledSubText typography="body_medium_s">{`${feeRate} ${feeRateUnits}`}</StyledSubText>
        </ColumnsTexts>
        {totalFee ? (
          <EndColumnTexts>
            <StyledHeading typography="body_medium_m" color="white_0">
              {`${totalFee} ${feeUnits}`}
            </StyledHeading>
            <StyledSubText typography="body_medium_s">
              <NumericFormat
                value={fiat}
                displayType="text"
                prefix={`~${currencySymbolMap[fiatUnit]}`}
                thousandSeparator
                renderText={(value: string) => `${value} ${fiatUnit}`}
              />
            </StyledSubText>
          </EndColumnTexts>
        ) : (
          <LoaderContainer>
            <MoonLoader color="white" size={20} />
          </LoaderContainer>
        )}
      </TextsContainer>
    </FeeItemContainer>
  );
}

export default FeeItem;
