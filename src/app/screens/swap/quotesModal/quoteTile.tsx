import useWalletSelector from '@hooks/useWalletSelector';
import { CaretRight } from '@phosphor-icons/react';
import { StyledP } from '@ui-library/common.styled';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import styled, { useTheme } from 'styled-components';

const Container = styled.button`
  display: flex;
  flex-direction: row;
  border: 1px solid ${({ theme }) => theme.colors.elevation6};
  border-radius: ${({ theme }) => theme.space.s};
  padding: ${({ theme }) => `${theme.space.m} ${theme.space.s}`};
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.space.xs};
  background: transparent;
`;

const SmallContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 ${({ theme }) => theme.space.xs};
  align-items: flex-start;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 ${({ theme }) => theme.space.xs};
  align-items: flex-end;
`;

const Image = styled.img`
  align-self: center;
  width: 32px;
  height: 32px;
`;

interface Props {
  provider: string;
  price: string;
  image: string;
  subtitle?: string;
  fiatValue?: string;
  floorText?: string;
  onClick: () => void;
  unit?: string;
}

function QuoteTile({
  provider,
  price,
  image,
  subtitle,
  fiatValue,
  floorText,
  onClick,
  unit,
}: Props) {
  const theme = useTheme();
  const { fiatCurrency } = useWalletSelector();

  return (
    <Container onClick={onClick}>
      <SmallContainer>
        <Image src={image} alt={`${provider} logo`} />
        <LeftColumn>
          <StyledP typography="body_m" color="white_0">
            {provider}
          </StyledP>
          {subtitle && (
            <StyledP typography="body_medium_s" color="success_light">
              {subtitle}
            </StyledP>
          )}
        </LeftColumn>
      </SmallContainer>
      <SmallContainer>
        <RightColumn>
          <NumericFormat
            value={price}
            displayType="text"
            thousandSeparator
            renderText={() => (
              <StyledP typography="body_m" color="white_0">
                {new BigNumber(price).toFixed(2)} {unit}
              </StyledP>
            )}
          />
          {fiatValue && (
            <NumericFormat
              value={fiatValue}
              displayType="text"
              thousandSeparator
              suffix={` ${fiatCurrency}`}
              renderText={(value: string) => (
                <StyledP typography="body_s" color="white_200">
                  {value}
                </StyledP>
              )}
            />
          )}
          {floorText && (
            <StyledP typography="body_s" color="white_200">
              {floorText}
            </StyledP>
          )}
        </RightColumn>
        <CaretRight size={theme.space.m} color={theme.colors.white_0} />
      </SmallContainer>
    </Container>
  );
}

export default QuoteTile;
