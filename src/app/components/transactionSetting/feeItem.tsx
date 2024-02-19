import { Bicycle, CarProfile, RocketLaunch } from '@phosphor-icons/react';
import { ErrorCodes } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Spinner from '@ui-library/spinner';
import { useTranslation } from 'react-i18next';
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
  margin-bottom: ${(props) => props.theme.space.xxs};
`;

const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`;

type FeePriority = 'high' | 'medium' | 'low';

interface FeeItemProps {
  priority: FeePriority;
  time: string;
  feeRate: string;
  totalFee: string;
  fiat: string | JSX.Element;
  selected: boolean;
  onClick?: () => void;
  error?: string;
}

function FeeItem({
  priority,
  time,
  feeRate,
  totalFee,
  fiat,
  selected,
  error,
  onClick,
}: FeeItemProps) {
  const { t } = useTranslation('translation');
  const getIcon = () => {
    switch (priority) {
      case 'high':
        return <RocketLaunch size={20} color={Theme.colors.tangerine} />;
      case 'medium':
        return <CarProfile size={20} color={Theme.colors.tangerine} />;
      case 'low':
        return <Bicycle size={20} color={Theme.colors.tangerine} />;
      default:
        return <RocketLaunch size={20} color={Theme.colors.tangerine} />;
    }
  };

  const getLabel = () => {
    switch (priority) {
      case 'high':
        return t('SPEED_UP_TRANSACTION.HIGH_PRIORITY');
      case 'medium':
        return t('SPEED_UP_TRANSACTION.MED_PRIORITY');
      case 'low':
        return t('SPEED_UP_TRANSACTION.LOW_PRIORITY');
      default:
        return t('SPEED_UP_TRANSACTION.HIGH_PRIORITY');
    }
  };

  const getErrorMessage = (btcError: string) => {
    if (
      Number(btcError) === ErrorCodes.InSufficientBalance ||
      Number(btcError) === ErrorCodes.InSufficientBalanceWithTxFee
    ) {
      return t('SEND.ERRORS.INSUFFICIENT_BALANCE');
    }
    return btcError;
  };

  return (
    <FeeItemContainer onClick={onClick} isSelected={selected} disabled={!totalFee || !!error}>
      <IconContainer>{getIcon()}</IconContainer>
      <TextsContainer>
        <ColumnsTexts>
          <StyledHeading typography="body_medium_m" color="white_0">
            {getLabel()}
          </StyledHeading>
          <StyledSubText typography="body_medium_s" color="white_200">
            {time}
          </StyledSubText>
          <StyledSubText
            typography="body_medium_s"
            color="white_200"
          >{`${feeRate} Sats/ vByte`}</StyledSubText>
        </ColumnsTexts>

        <EndColumnTexts>
          {totalFee && (
            <StyledHeading typography="body_medium_m" color="white_0">
              {`${totalFee} Sats`}
            </StyledHeading>
          )}
          <StyledSubText typography="body_medium_s" color="white_200">
            {fiat}
          </StyledSubText>
          {error && (
            <StyledSubText typography="body_medium_s" color="danger_medium">
              {getErrorMessage(error)}
            </StyledSubText>
          )}
        </EndColumnTexts>

        {!totalFee && !error && (
          <LoaderContainer>
            <Spinner color="white" size={20} />
          </LoaderContainer>
        )}
      </TextsContainer>
    </FeeItemContainer>
  );
}

export default FeeItem;
