import FloorComparisonLabel from '@screens/listRune/floorComparisonLabel';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import { formatToXDecimalPlaces } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ButtonContainer = styled.div((props) => ({
  marginTop: props.theme.space.l,
  button: {
    border: '0px !important',
  },
}));

const Description = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.l,
}));

const AmountInputContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.space.xs,
  marginBottom: props.theme.space.xs,
  border: `1px solid ${props.theme.colors.white_800}`,
  backgroundColor: props.theme.colors.elevation1,
  borderRadius: 8,
  paddingLeft: props.theme.space.xxs,
  paddingRight: props.theme.space.xxs,
  height: 44,
}));

const InputFieldContainer = styled.div(() => ({
  flex: 1,
}));

const InputField = styled.input((props) => ({
  ...props.theme.typography.body_m,
  backgroundColor: props.theme.colors.elevation1,
  color: props.theme.colors.white_200,
  width: '100%',
  border: 'transparent',
  '&::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&[type=number]': {
    '-moz-appearance': 'textfield',
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
      <Description>
        {t('MIN_PRICE_LABEL', {
          symbol: runeSymbol,
          price: formatToXDecimalPlaces(minPriceSats, 10),
        })}
      </Description>
      <StyledP typography="body_medium_m" color="white_200">
        {t('LISTING_PRICE')}
      </StyledP>
      <AmountInputContainer>
        <InputFieldContainer>
          <InputField
            type="number"
            min="0"
            value={priceSats}
            placeholder="0"
            onChange={(event) => setPriceSats(event.target.value)}
          />
        </InputFieldContainer>
        <StyledP typography="body_medium_m" color="white_200">{`Sats/${runeSymbol}`}</StyledP>
      </AmountInputContainer>
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
    </Sheet>
  );
}

export default SetCustomPriceModal;
