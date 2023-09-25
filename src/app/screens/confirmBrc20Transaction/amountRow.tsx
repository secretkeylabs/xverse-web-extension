import styled from 'styled-components';
import { StyledP } from '@ui-library/common.styled';

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing(5)}px;
`;

const SubTextContainer = styled.div`
  margin-top: -5px;
  min-height: 16px;
  width: 100%;
  text-align: end;
`;

function AmountRow({
  icon,
  amountLabel,
  amount,
  amountSubText,
}: {
  icon: React.ReactNode;
  amountLabel: string;
  amount: React.ReactNode;
  amountSubText: React.ReactNode;
}) {
  return (
    <div>
      <RowContainer>
        <LabelContainer>
          {icon}
          <StyledP typography="body_medium_m" color="white_200">
            {amountLabel}
          </StyledP>
        </LabelContainer>
        <StyledP typography="body_medium_m" color="white_0">
          {amount}
        </StyledP>
      </RowContainer>
      <SubTextContainer>
        <StyledP typography="body_medium_s" color="white_400">
          {amountSubText}
        </StyledP>
      </SubTextContainer>
    </div>
  );
}

export default AmountRow;
