import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import type { BtcFeeResponse } from '@secretkeylabs/xverse-core';

import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';

const DEFAULT_MIN_FEE_RATE = 6;

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(2),
}));

const ApplyButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(10),
  marginBottom: props.theme.spacing(20),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const DetailText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['200'],
  marginTop: props.theme.spacing(8),
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(8),
}));

const InputContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(6),
  border: `1px solid ${props.theme.colors.background.elevation6}`,
  backgroundColor: props.theme.colors.background.elevation1,
  borderRadius: 8,
  padding: props.theme.spacing(5),
}));

const InputField = styled.input((props) => ({
  ...props.theme.body_m,
  backgroundColor: 'transparent',
  color: props.theme.colors.white['0'],
  border: 'transparent',
  flex: 1,
  '&::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&[type=number]': {
    '-moz-appearance': 'textfield',
  },
}));

const FeeText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['0'],
}));

interface ButtonProps {
  isSelected: boolean;
  isLastInRow?: boolean;
}
const FeeButton = styled.button<ButtonProps>((props) => ({
  ...props.theme.body_medium_m,
  color: `${
    props.isSelected ? props.theme.colors.background.elevation2 : props.theme.colors.white['400']
  }`,
  background: `${props.isSelected ? props.theme.colors.white : 'transparent'}`,
  border: `1px solid ${
    props.isSelected ? 'transparent' : props.theme.colors.background.elevation6
  }`,
  borderRadius: 40,
  width: 104,
  height: 40,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: props.isLastInRow ? 0 : 8,
}));

const ButtonContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 12,
});

const FeeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

type Options = 'standard' | 'high' | 'custom';

const getInitialFeeOption = (feeRate: number, feeRates?: BtcFeeResponse): Options => {
  if (feeRates) {
    if (feeRate === feeRates.regular) {
      return 'standard';
    }
    if (feeRate === feeRates.priority) {
      return 'high';
    }
  }
  return 'custom';
};

interface Props {
  feeRate: number;
  feeRates?: BtcFeeResponse;
  onDone: (number) => void;
  onCancel: () => void;
}
function EditFee({ feeRate, feeRates, onDone, onCancel }: Props) {
  const { t } = useTranslation('translation');

  const initialOption = getInitialFeeOption(feeRate, feeRates);
  const [selectedOption, setSelectedOption] = useState<Options>(initialOption);
  const [feeRateInput, setFeeRateInput] = useState<string>(feeRate.toString());

  const onInputEditFeesChange = (event) => {
    const { value } = event.target;
    if (value === '') {
      setFeeRateInput(value);
    } else if (Number(value) > 0) {
      setFeeRateInput(value);
    }
    setSelectedOption('custom');
  };

  const modifyFees = (option: Options) => {
    setSelectedOption(option);

    if (option === 'standard') {
      setFeeRateInput(feeRates?.regular.toString() ?? '');
    }
    if (option === 'high') {
      setFeeRateInput(feeRates?.priority.toString() ?? '');
    }
  };

  const feesTooLow = feeRates
    ? +feeRateInput < feeRates.limits.min
    : +feeRateInput < DEFAULT_MIN_FEE_RATE;
  const feesTooHigh = feeRates ? +feeRateInput > feeRates.limits.max : false;
  const feesAreValid = !feesTooLow && !feesTooHigh;

  // eslint-disable-next-line no-nested-ternary
  const buttonText = feesTooLow
    ? t('INSCRIPTION_REQUEST.FEES_TOO_LOW', { fee: feeRates?.limits.min ?? DEFAULT_MIN_FEE_RATE })
    : feesTooHigh
    ? t('INSCRIPTION_REQUEST.FEES_TOO_HIGH', { fee: feeRates!.limits.max })
    : t('TRANSACTION_SETTING.APPLY');

  return (
    <BottomModal
      visible
      header={t('TRANSACTION_SETTING.ADVANCED_SETTING_FEE_OPTION')}
      onClose={onCancel}
    >
      <Container>
        <Text>{t('TRANSACTION_SETTING.FEE')}</Text>
        <FeeContainer>
          <InputContainer>
            <InputField
              type="number"
              value={feeRateInput?.toString()}
              onChange={onInputEditFeesChange}
            />
            <FeeText>{t('UNITS.SATS_PER_VB')}</FeeText>
          </InputContainer>
        </FeeContainer>
        <ButtonContainer>
          <FeeButton
            isSelected={selectedOption === 'standard'}
            onClick={() => modifyFees('standard')}
          >
            {t('TRANSACTION_SETTING.STANDARD')}
          </FeeButton>
          <FeeButton isSelected={selectedOption === 'high'} onClick={() => modifyFees('high')}>
            {t('TRANSACTION_SETTING.HIGH')}
          </FeeButton>
          <FeeButton
            isSelected={selectedOption === 'custom'}
            isLastInRow
            onClick={() => modifyFees('custom')}
          >
            {t('TRANSACTION_SETTING.CUSTOM')}
          </FeeButton>
        </ButtonContainer>
        <DetailText>{t('TRANSACTION_SETTING.FEE_INFO')}</DetailText>
      </Container>
      <ApplyButtonContainer>
        <ActionButton
          text={buttonText}
          disabled={!feesAreValid}
          onPress={() => onDone(+feeRateInput)}
          warning={feesTooLow || feesTooHigh}
        />
      </ApplyButtonContainer>
    </BottomModal>
  );
}

export default EditFee;
