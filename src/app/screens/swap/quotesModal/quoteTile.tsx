import FormattedNumber from '@components/formattedNumber';
import TokenImage from '@components/tokenImage';
import useWalletSelector from '@hooks/useWalletSelector';
import { CaretRight } from '@phosphor-icons/react';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import { formatBalance } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { NumericFormat } from 'react-number-format';
import styled, { useTheme } from 'styled-components';
import type { Color } from 'theme';

const MainContainer = styled.button<{ clickable: boolean }>`
  display: flex;
  flex-direction: row;
  border: 1px solid ${({ theme }) => theme.colors.elevation6};
  border-radius: ${({ theme }) => theme.space.s};
  padding: ${({ theme }) => `${theme.space.m} ${theme.space.s}`};
  margin-top: ${({ theme }) => theme.space.xs};
  background: transparent;
  width: 100%;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  align-items: center;
  justify-content: center;
`;

const RowContainers = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-left: ${({ theme }) => theme.space.m};
  margin-right: ${({ theme }) => theme.space.s};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space.m};
  white-space: nowrap;
`;

const TruncatedP = styled(StyledP)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PriceUnitContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
`;

const GreenEllipse = styled.div`
  width: 6px;
  height: 6px;
  background-color: ${({ theme }) => theme.colors.success_light};
  border-radius: 50%;
`;

const SubtitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xxs};
`;

interface Props {
  provider: string;
  price: string;
  image?: string;
  token?: FungibleToken;
  subtitle?: string;
  subtitleColorOverride?: Color;
  fiatValue?: string;
  floorText?: string;
  onClick?: () => void;
  unit?: string;
}

function QuoteTile({
  provider,
  price,
  image,
  token,
  subtitle,
  subtitleColorOverride,
  fiatValue,
  floorText,
  onClick,
  unit,
}: Props) {
  const theme = useTheme();
  const { fiatCurrency } = useWalletSelector();

  const getSubtitleColor = (): Color | undefined => {
    if (!subtitle) return undefined;
    return subtitle.startsWith('+') ? 'danger_light' : 'success_light';
  };

  const subtitleColor = subtitleColorOverride ?? getSubtitleColor();

  return (
    <MainContainer data-testid="swap-place-button" onClick={onClick} clickable={Boolean(onClick)}>
      <TokenImage fungibleToken={token} imageUrl={image} size={32} />
      <RowContainers>
        <RowContainer>
          <TruncatedP data-testid="place-name" typography="body_bold_m" color="white_0">
            {provider}
          </TruncatedP>
          <PriceUnitContainer>
            <NumericFormat
              value={price}
              displayType="text"
              thousandSeparator
              renderText={() => (
                <TruncatedP data-testid="quote-label" typography="body_bold_m" color="white_0">
                  <FormattedNumber number={formatBalance(price)} tokenSymbol={unit} />
                </TruncatedP>
              )}
            />
          </PriceUnitContainer>
        </RowContainer>
        <RowContainer>
          {subtitle && subtitleColor && (
            <TruncatedP data-testid="info-message" typography="body_medium_s" color={subtitleColor}>
              <SubtitleContainer>
                {subtitleColor === 'success_light' && <GreenEllipse />}
                {subtitle}
              </SubtitleContainer>
            </TruncatedP>
          )}
          {fiatValue && (
            <NumericFormat
              value={fiatValue}
              displayType="text"
              thousandSeparator
              prefix="~ $"
              suffix={` ${fiatCurrency}`}
              renderText={(value: string) => (
                <StyledP data-testid="usd-text" typography="body_s" color="white_200">
                  {value || '--'}
                </StyledP>
              )}
            />
          )}
          {floorText && (
            <StyledP typography="body_s" color="white_200">
              {floorText}
            </StyledP>
          )}
        </RowContainer>
      </RowContainers>
      {onClick && <CaretRight size={theme.space.m} color={theme.colors.white_0} />}
    </MainContainer>
  );
}

export default QuoteTile;
