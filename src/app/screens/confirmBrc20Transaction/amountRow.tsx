import { StyledP } from '@ui-library/common.styled';
import styled from 'styled-components';

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.space.m};
`;

const TextContainer = styled.div`
  text-align: end;
`;

const StyledSubtext = styled(StyledP)`
  margin-top: ${(props) => props.theme.space.xxxs};
`;

function AmountRow({
  icon,
  amountLabel,
  amount,
  amountSubText,
  ticker,
}: {
  icon: React.ReactNode;
  amountLabel: string;
  amount: React.ReactNode;
  amountSubText: React.ReactNode;
  ticker: string;
}) {
  return (
    <div>
      <RowContainer>
        <LabelContainer>
          {icon}
          <div>
            <StyledP typography="body_medium_m" color="white_0">
              {amountLabel}
            </StyledP>
            <StyledSubtext typography="body_medium_s" color="white_400">
              {ticker} Token
            </StyledSubtext>
          </div>
        </LabelContainer>
        <TextContainer>
          <StyledP typography="body_medium_m" color="white_0">
            {amount}
          </StyledP>
          <StyledSubtext typography="body_medium_s" color="white_400">
            {amountSubText}
          </StyledSubtext>
        </TextContainer>
      </RowContainer>
    </div>
  );
}

export default AmountRow;
