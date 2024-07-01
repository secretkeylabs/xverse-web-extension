import useCoinRates from '@hooks/queries/useCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { PencilSimple } from '@phosphor-icons/react';
import FloorComparisonLabel from '@screens/listRune/floorComparisonLabel';
import { currencySymbolMap, getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const RuneTitle = styled(StyledP)`
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: left;
`;

const RightAlignStyledP = styled(StyledP)`
  text-align: right;
`;

const ItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  flex: 1;
  padding: ${(props) => props.theme.space.s};
  padding-right: ${(props) => props.theme.space.m};
  border-radius: ${(props) => props.theme.space.xs};
  border: 1px solid ${(props) => props.theme.colors.white_900};
  background-color: ${(props) => props.theme.colors.elevation2};
`;

const Label = styled.span`
  ${(props) => props.theme.typography.body_medium_s};
  color: ${(props) => props.theme.colors.tangerine};
  transition: color 0.1s ease;
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: ${(props) => props.theme.space.xxs};

  &:hover {
    color: ${(props) => props.theme.colors.tangerine_200};
  }
`;

const InfoRowContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.space.xs};
`;

type Props = {
  runeAmount: number;
  runeSymbol: string;
  satAmount: number;
  satPrice: number;
  floorPriceSats: number;
  handleShowCustomPriceModal: () => void;
};

function SetRunePriceItem({
  runeAmount,
  runeSymbol,
  satAmount,
  satPrice,
  floorPriceSats,
  handleShowCustomPriceModal,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'LIST_RUNE_SCREEN' });
  const { btcFiatRate } = useCoinRates();
  const { fiatCurrency } = useWalletSelector();

  return (
    <>
      <ItemContainer data-testid="rune-container">
        <InfoContainer>
          <NumericFormat
            value={runeAmount}
            displayType="text"
            suffix={` ${runeSymbol}`}
            thousandSeparator
            renderText={(value: string) => (
              <RuneTitle data-testid="rune-title" typography="body_medium_m" color="white_0">
                {value}
              </RuneTitle>
            )}
          />
          <NumericFormat
            value={satAmount}
            displayType="text"
            prefix="Size: "
            suffix={` sats`}
            thousandSeparator
            renderText={(value: string) => (
              <StyledP typography="body_medium_s" color="white_200">
                {value}
              </StyledP>
            )}
          />
        </InfoContainer>
        <InfoContainer data-testid="rune-price">
          <NumericFormat
            value={String(satPrice)}
            displayType="text"
            suffix=" sats"
            thousandSeparator
            decimalScale={5}
            allowNegative={false}
            renderText={(value: string) => (
              <RightAlignStyledP typography="body_medium_m" color="white_0">
                {value}
              </RightAlignStyledP>
            )}
          />
          <InfoRowContainer>
            <NumericFormat
              value={String(
                getBtcFiatEquivalent(
                  new BigNumber(satPrice).multipliedBy(runeAmount),
                  BigNumber(btcFiatRate),
                ),
              )}
              decimalScale={5}
              displayType="text"
              prefix={`~ ${currencySymbolMap[fiatCurrency]}`}
              suffix={` ${fiatCurrency}`}
              thousandSeparator
              allowNegative={false}
              renderText={(value: string) => (
                <RightAlignStyledP typography="body_medium_s" color="white_200">
                  {value}
                </RightAlignStyledP>
              )}
            />
            <Label onClick={handleShowCustomPriceModal}>
              {t('EDIT')} <PencilSimple size={16} weight="fill" />
            </Label>
          </InfoRowContainer>
        </InfoContainer>
      </ItemContainer>
      <FloorComparisonLabel
        floorPriceSats={floorPriceSats}
        priceSats={satPrice}
        lowError={satPrice * runeAmount < 10000}
        highError={satPrice * runeAmount > 1000000000}
        typography="body_medium_s"
      />
    </>
  );
}

export default SetRunePriceItem;
