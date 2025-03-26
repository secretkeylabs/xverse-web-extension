import { CaretRight } from '@phosphor-icons/react';
import styled from 'styled-components';
import { StyledP } from './common.styled';

const CardButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space.m};
  padding: ${({ theme }) => theme.space.m};
  border-radius: ${({ theme }) => theme.radius(2)}px;
  border: 1px solid ${({ theme }) => theme.colors.white_850};
  color: ${({ theme }) => theme.colors.white_0};
  background-color: transparent;
  text-align: left;
  transition: background-color 0.1s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.elevation6_800};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.elevation6_600};
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.m};
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xxxs};
`;

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
  label: string;
  description: string;
  withArrow?: boolean;
};

function ActionCard({ icon, label, description, withArrow = false, ...props }: Props) {
  return (
    <CardButton {...props}>
      <ContentWrapper>
        {icon}
        <TextContainer>
          <StyledP typography="body_medium_m">{label}</StyledP>
          <StyledP typography="body_medium_m" color="white_400">
            {description}
          </StyledP>
        </TextContainer>
      </ContentWrapper>
      {withArrow && <CaretRight size={16} weight="bold" />}
    </CardButton>
  );
}

export default ActionCard;
