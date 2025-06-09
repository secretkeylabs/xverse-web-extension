import { CaretDown, CheckCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import useGetSupportedCurrencies from '@hooks/queries/onramp/useGetSupportedCurrencies';
import Button from '@ui-library/button';

import { SheetSelect, SheetSelectItem } from './index.styled';

const CurrencyButton = styled(Button)((props) => ({
  width: 'auto',
  padding: `${props.theme.space.xs} ${props.theme.space.s}`,
}));

const CurrencyButtonContent = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  gap: props.theme.space.xs,
}));

const CurrencyIconButton = styled.img((props) => ({
  width: props.theme.space.m,
  height: props.theme.space.m,
}));

const CurrencyData = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const CurrencyIcon = styled.img((props) => ({
  width: props.theme.space.l,
  height: props.theme.space.l,
  marginRight: props.theme.space.s,
}));

const CurrencyCode = styled.span((props) => ({
  marginLeft: props.theme.space.xs,
  color: props.theme.colors.white_400,
}));

type Props = {
  value?: string;
  onChange: (value: string) => void;
};

function SelectCurrency({ value, onChange }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'BUY_SCREEN' });

  const supportedCurrencies = useGetSupportedCurrencies();

  const [showCurrencySheet, setShowCurrencySheet] = useState(false);

  if (!supportedCurrencies.isSuccess) {
    return null;
  }

  const selectedCurrency = supportedCurrencies.data.message.fiat.find(
    (currency) => currency.code === value,
  );

  const handleCurrencyChange = (currencyCode: string) => {
    onChange(currencyCode);
    setShowCurrencySheet(false);
  };

  return (
    <>
      <CurrencyButton
        variant="secondary"
        type="button"
        title={
          (
            <CurrencyButtonContent>
              <CurrencyIconButton src={selectedCurrency?.icon} />
              {value}
            </CurrencyButtonContent>
          ) as unknown as string
        }
        iconPosition="right"
        icon={<CaretDown size={16} />}
        onClick={() => setShowCurrencySheet(true)}
      />
      <SheetSelect
        title={t('CURRENCY')}
        visible={showCurrencySheet}
        onClose={() => setShowCurrencySheet(false)}
      >
        <ul>
          {supportedCurrencies.data.message.fiat.map((currency) => {
            const isSelected = currency.code === value;

            return (
              <SheetSelectItem
                key={currency.id}
                onClick={() => handleCurrencyChange(currency.code)}
              >
                <CurrencyData>
                  <CurrencyIcon src={currency.icon} />
                  {currency.name}
                  <CurrencyCode>{currency.code}</CurrencyCode>
                </CurrencyData>
                {isSelected && <CheckCircle color="white" weight="fill" size={20} />}
              </SheetSelectItem>
            );
          })}
        </ul>
      </SheetSelect>
    </>
  );
}

export default SelectCurrency;
