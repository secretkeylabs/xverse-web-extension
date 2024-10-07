import FiatAmountText from '@components/fiatAmountText';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { getStxFiatEquivalent, stxToMicrostacks } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(2),
}));

const DetailText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
}));

const Text = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  marginTop: props.theme.spacing(8),
}));

const InputContainer = styled.div<{
  withError?: boolean;
}>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(6),
  border: `1px solid ${
    props.withError ? props.theme.colors.feedback.error : props.theme.colors.elevation6
  }`,
  backgroundColor: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(1),
  padding: props.theme.spacing(5),
}));

const InputField = styled.input((props) => ({
  ...props.theme.typography.body_m,
  backgroundColor: 'transparent',
  color: props.theme.colors.white_0,
  border: 'transparent',
  width: '50%',
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

const FeeButton = styled.button<{
  isSelected: boolean;
  isLastInRow?: boolean;
}>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: `${props.isSelected ? props.theme.colors.elevation2 : props.theme.colors.white_400}`,
  background: `${props.isSelected ? props.theme.colors.white : 'transparent'}`,
  border: `1px solid ${props.isSelected ? 'transparent' : props.theme.colors.elevation6}`,
  borderRadius: props.theme.radius(9),
  width: 82,
  height: 40,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: props.isLastInRow ? 0 : 8,
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(6),
}));

const FeeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const TickerContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  flex: 1,
});

const ErrorText = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.feedback.error,
  marginBottom: props.theme.spacing(2),
}));

// TODO tim: this component needs refactoring. separate business logic from presentation
type Props = {
  fee: string;
  feeRate?: BigNumber | string;
  feeMode: string;
  error: string;
  setFee: (fee: string) => void;
  setFeeRate: (feeRate: string) => void;
  setFeeMode: (feeMode: string) => void;
  setError: (error: string) => void;
};

function EditStxFee({
  fee,
  feeRate,
  feeMode,
  error,
  setFee,
  setFeeRate,
  setError,
  setFeeMode,
}: Props) {
  const { t } = useTranslation('translation');
  const { fiatCurrency } = useWalletSelector();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const [totalFee, setTotalFee] = useState(fee);
  const [feeRateInput, setFeeRateInput] = useState(feeRate?.toString() ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const modifyStxFees = (mode: string) => {
    const currentFee = new BigNumber(fee);
    setFeeMode(mode);
    setError('');
    switch (mode) {
      case 'low':
        setFeeRateInput(currentFee.dividedBy(2).toString());
        setTotalFee(currentFee.dividedBy(2).toString());
        break;
      case 'medium':
        setFeeRateInput(currentFee.toString());
        setTotalFee(currentFee.toString());
        break;
      case 'high':
        setFeeRateInput(currentFee.multipliedBy(2).toString());
        setTotalFee(currentFee.multipliedBy(2).toString());
        break;
      case 'custom':
        inputRef.current?.focus();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (feeMode !== 'custom') {
      modifyStxFees(feeMode);
    }
  }, [feeMode]);

  useEffect(() => {
    setFee(totalFee);
  }, [totalFee]);

  useEffect(() => {
    if (feeRateInput) {
      setFeeRate(feeRateInput);
    }
  }, [feeRateInput]);

  const onInputEditFeesChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    if (error) {
      setError('');
    }

    if (feeMode !== 'custom') {
      setFeeMode('custom');
    }

    setFeeRateInput(value);
    setTotalFee(value);
  };

  return (
    <Container>
      <DetailText>{t('TRANSACTION_SETTING.FEE_INFO')}</DetailText>
      <Text>{t('TRANSACTION_SETTING.FEE')}</Text>
      <FeeContainer>
        <InputContainer withError={!!error}>
          <InputField
            type="number"
            ref={inputRef}
            value={feeRateInput?.toString()}
            onChange={onInputEditFeesChange}
          />
          <TickerContainer>
            <FiatAmountText
              fiatAmount={getStxFiatEquivalent(
                stxToMicrostacks(new BigNumber(totalFee)),
                BigNumber(stxBtcRate),
                BigNumber(btcFiatRate),
              )}
              fiatCurrency={fiatCurrency}
            />
          </TickerContainer>
        </InputContainer>
        {error && <ErrorText>{error}</ErrorText>}
      </FeeContainer>
      <ButtonContainer>
        <FeeButton isSelected={feeMode === 'low'} onClick={() => modifyStxFees('low')}>
          {t('TRANSACTION_SETTING.LOW')}
        </FeeButton>
        <FeeButton isSelected={feeMode === 'medium'} onClick={() => modifyStxFees('medium')}>
          {t('TRANSACTION_SETTING.STANDARD')}
        </FeeButton>
        <FeeButton isSelected={feeMode === 'high'} onClick={() => modifyStxFees('high')}>
          {t('TRANSACTION_SETTING.HIGH')}
        </FeeButton>
        <FeeButton
          isSelected={feeMode === 'custom'}
          isLastInRow
          onClick={() => modifyStxFees('custom')}
        >
          {t('TRANSACTION_SETTING.CUSTOM')}
        </FeeButton>
      </ButtonContainer>
    </Container>
  );
}

export default EditStxFee;
