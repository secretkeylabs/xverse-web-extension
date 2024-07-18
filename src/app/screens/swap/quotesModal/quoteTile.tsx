import TokenImage from '@components/tokenImage';
import useWalletSelector from '@hooks/useWalletSelector';
import { CaretRight } from '@phosphor-icons/react';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import type { CurrencyTypes } from '@utils/constants';
import { formatNumber } from '@utils/helper';
import { NumericFormat } from 'react-number-format';
import styled, { useTheme } from 'styled-components';
import type { Color } from 'theme';

const Container = styled.button<{ clickable: boolean }>`
  display: flex;
  flex-direction: row;
  border: 1px solid ${({ theme }) => theme.colors.elevation6};
  border-radius: ${({ theme }) => theme.space.s};
  padding: ${({ theme }) => `${theme.space.m} ${theme.space.s}`};
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.space.xs};
  background: transparent;
  width: 100%;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
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

interface Props {
  provider: string;
  price: string;
  image: {
    currency?: CurrencyTypes;
    ft?: FungibleToken;
  };
  subtitle?: string;
  subtitleColor?: Color;
  fiatValue?: string;
  floorText?: string;
  onClick?: () => void;
  unit?: string;
}

function QuoteTile({
  provider,
  price,
  image,
  subtitle,
  subtitleColor,
  fiatValue,
  floorText,
  onClick,
  unit,
}: Props) {
  const theme = useTheme();
  const { fiatCurrency } = useWalletSelector();

  return (
    <Container onClick={onClick} clickable={Boolean(onClick)}>
      <SmallContainer>
        <TokenImage
          currency={image.currency}
          fungibleToken={image.ft}
          size={32}
          showProtocolIcon={false}
        />
        <LeftColumn>
          <StyledP typography="body_m" color="white_0">
            {provider}
          </StyledP>
          {subtitle && subtitleColor && (
            <StyledP typography="body_medium_s" color={subtitleColor}>
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
                {formatNumber(price)} {unit}
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
        {onClick && <CaretRight size={theme.space.m} color={theme.colors.white_0} />}
      </SmallContainer>
    </Container>
  );
}

export default QuoteTile;
