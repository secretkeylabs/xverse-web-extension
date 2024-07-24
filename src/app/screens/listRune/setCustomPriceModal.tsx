import FloorComparisonLabel from '@screens/listRune/floorComparisonLabel';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import Input from '@ui-library/input';
import Sheet from '@ui-library/sheet';
import { formatToXDecimalPlaces } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Description = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.l,
}));

const InputContainer = styled.div((props) => ({
  marginTop: props.theme.space.xs,
  '& input': {
    '-webkit-appearance': 'none',
    '-moz-appearance': 'textfield',
    backgroundColor: props.theme.colors.elevation1,
    '&::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
  },
}));

const ButtonContainer = styled.div((props) => ({
  margin: `${props.theme.space.l} 0 ${props.theme.space.xl}`,
  button: {
    border: '0px !important',
  },
}));

type Props = {
  runeSymbol: string;
  visible: boolean;
  onClose: () => void;
  title: string;
  floorPriceSats: number;
  minPriceSats: number;
  maxPriceSats: number;
  onApplyPrice: (priceSats: number) => void;
};

function SetCustomPriceModal({
  runeSymbol,
  visible,
  onClose,
  title,
  floorPriceSats,
  minPriceSats,
  maxPriceSats,
  onApplyPrice,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'LIST_RUNE_SCREEN' });
  const [priceSats, setPriceSats] = useState('');

  const lowError: boolean = priceSats.length !== 0 && Number(priceSats) < minPriceSats;
  const highError: boolean = priceSats.length !== 0 && Number(priceSats) > maxPriceSats;

  return (
    <Sheet
      visible={visible}
      contentStylesOverriding={{ backdropFilter: 'blur(12px)' }}
      title={title}
      onClose={() => {
        setPriceSats('');
        onClose();
      }}
    >
      <form>
        <Description>
          {t('MIN_PRICE_LABEL', {
            symbol: runeSymbol,
            price: formatToXDecimalPlaces(minPriceSats, 10),
          })}
        </Description>
        <StyledP typography="body_medium_m" color="white_200">
          {t('LISTING_PRICE')}
        </StyledP>
        <InputContainer>
          <Input
            value={priceSats}
            onChange={(event) => setPriceSats(event.target.value)}
            placeholder="0"
            type="number"
            complications={
              <StyledP typography="body_medium_m" color="white_200">
                sats/{runeSymbol}
              </StyledP>
            }
            hideClear
            autoFocus
          />
        </InputContainer>
        {priceSats && (
          <FloorComparisonLabel
            floorPriceSats={floorPriceSats}
            priceSats={Number(priceSats)}
            lowError={lowError}
            highError={highError}
            typography="body_medium_m"
          />
        )}
        <ButtonContainer>
          <Button
            title={t('APPLY')}
            onClick={() => {
              onApplyPrice(Number(priceSats));
              setPriceSats('');
            }}
            variant="primary"
            disabled={
              Number.isNaN(Number(priceSats)) || Number(priceSats) <= 0 || lowError || highError
            }
          />
        </ButtonContainer>
      </form>
    </Sheet>
  );
}

export default SetCustomPriceModal;
