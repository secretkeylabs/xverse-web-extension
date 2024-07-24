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
  margin-top: ${({ theme }) => theme.space.xs};
  background: transparent;
  width: 100%;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
`;

const RowCenter = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex: 1;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: ${({ theme }) => theme.space.m};
  margin-right: ${({ theme }) => theme.space.s};
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
    <Container data-testid="swap-place-button" onClick={onClick} clickable={Boolean(onClick)}>
      <TokenImage currency={image.currency} fungibleToken={image.ft} size={32} />
      <InfoContainer>
        <RowCenter>
          <StyledP data-testid="place-name" typography="body_bold_m" color="white_0">
            {provider}
          </StyledP>
          <NumericFormat
            value={price}
            displayType="text"
            thousandSeparator
            renderText={() => (
              <StyledP data-testid="quote-label" typography="body_bold_m" color="white_0">
                {formatNumber(price)} {unit}
              </StyledP>
            )}
          />
        </RowCenter>
        <RowCenter>
          {subtitle && subtitleColor && (
            <StyledP data-testid="info-message" typography="body_medium_s" color={subtitleColor}>
              {subtitle}
            </StyledP>
          )}
          {fiatValue && (
            <NumericFormat
              value={fiatValue}
              displayType="text"
              thousandSeparator
              suffix={` ${fiatCurrency}`}
              renderText={(value: string) => (
                <StyledP data-testid="usd-text" typography="body_s" color="white_200">
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
        </RowCenter>
      </InfoContainer>
      {onClick && <CaretRight size={theme.space.m} color={theme.colors.white_0} />}
    </Container>
  );
}

export default QuoteTile;
