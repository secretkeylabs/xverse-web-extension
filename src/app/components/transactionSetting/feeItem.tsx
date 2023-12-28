import { Bicycle, CarProfile, RocketLaunch } from '@phosphor-icons/react';
import { StyledP } from '@ui-library/common.styled';
import styled from 'styled-components';

const FeeItemContainer = styled.button`
  display: flex;
  padding: 12px 16px;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  border-radius: 12px;
  border: 1px solid var(--White-850, rgba(255, 255, 255, 0.15));
  flex-direction: row;
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
`;

const ColumnsTexts = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledHeading = styled(StyledP)`
  margin-bottom: ${(props) => props.theme.space.xxs};
`;

const StyledSubText = styled(StyledP)`
  color: ${(props) => props.theme.colors.white_200};
  margin-bottom: ${(props) => props.theme.space.xxs};
`;

type FeePriority = 'high' | 'medium' | 'low';

interface FeeItemProps {
  priority: FeePriority;
  time: string;
  feeRate: string;
  totalFee: string;
  fiat: string;
}

function FeeItem({ priority, time, feeRate, totalFee, fiat }: FeeItemProps) {
  const getIcon = () => {
    switch (priority) {
      case 'high':
        return <RocketLaunch size={20} />;
      case 'medium':
        return <CarProfile size={20} />;
      case 'low':
        return <Bicycle size={20} />;
      default:
        return <RocketLaunch size={20} />;
    }
  };

  // todo: localisation
  const getLabel = () => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return 'High Priority';
    }
  };

  return (
    <FeeItemContainer>
      <IconContainer>{getIcon()}</IconContainer>
      <TextsContainer>
        <ColumnsTexts>
          <StyledHeading typography="body_medium_m">{getLabel()}</StyledHeading>
          <StyledSubText typography="body_medium_s">{time}</StyledSubText>
          <StyledSubText typography="body_medium_s">{feeRate}</StyledSubText>
        </ColumnsTexts>
        <ColumnsTexts>
          <StyledHeading typography="body_medium_m">{totalFee}</StyledHeading>
          <StyledSubText typography="body_medium_s">{fiat}</StyledSubText>
        </ColumnsTexts>
      </TextsContainer>
    </FeeItemContainer>
  );
}

export default FeeItem;
