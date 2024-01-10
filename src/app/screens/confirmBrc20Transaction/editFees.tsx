import { BetterBarLoader } from '@components/barLoader';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import FiatAmountText from '@components/fiatAmountText';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useWalletSelector from '@hooks/useWalletSelector';
import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';
import InputFeedback from '@ui-library/inputFeedback';
import { handleKeyDownFeeRateInput } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(2),
}));

const DetailText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(8),
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(8),
}));

// TODO create input component in ui-library
const InputContainer = styled.div<{ withError?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(6),
  border: `1px solid ${
    props.withError ? props.theme.colors.danger_dark_200 : props.theme.colors.white_800
  }`,
  backgroundColor: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(1),
  padding: props.theme.spacing(5),
}));

const InputField = styled.input((props) => ({
  ...props.theme.body_m,
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

const FeeText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_0,
}));

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: ${(props) => props.theme.spacing(6)}px;
  gap: ${(props) => props.theme.spacing(4)}px;
`;

const FeeButton = styled.button<{
  isSelected: boolean;
}>((props) => ({
  ...props.theme.body_medium_m,
  color: `${props.isSelected ? props.theme.colors.elevation2 : props.theme.colors.white_400}`,
  background: `${props.isSelected ? props.theme.colors.white : 'transparent'}`,
  border: `1px solid ${props.isSelected ? 'transparent' : props.theme.colors.elevation6}`,
  borderRadius: 40,
  height: 40,
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
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
  minHeight: 34,
});

const ApplyButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 16px 40px;
`;

const StyledInputFeedback = styled(InputFeedback)`
  margin-bottom: ${(props) => props.theme.spacing(2)}px;
`;

const StyledFiatAmountText = styled(FiatAmountText)((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white_400,
}));

const buttons = [
  {
    value: 'standard',
    label: 'TRANSACTION_SETTING.STANDARD',
  },
  {
    value: 'high',
    label: 'TRANSACTION_SETTING.HIGH',
  },
  {
    value: 'custom',
    label: 'TRANSACTION_SETTING.CUSTOM',
  },
];

export type OnChangeFeeRate = (feeRate: string) => void;

export function EditFees({
  visible,
  onClose,
  onClickApply,
  onChangeFeeRate,
  fee,
  initialFeeRate,
  isFeeLoading,
  error,
}: {
  visible: boolean;
  onClose: () => void;
  onClickApply: OnChangeFeeRate;
  onChangeFeeRate: OnChangeFeeRate;
  fee: string;
  initialFeeRate: string;
  isFeeLoading: boolean;
  error: string;
}) {
  const { t } = useTranslation('translation');
  const { btcFiatRate, fiatCurrency } = useWalletSelector();
  const { data: feeRates } = useBtcFeeRate();

  // save the previous state in case user clicks X without applying
  const [previousFeeRate, setPreviousFeeRate] = useState(initialFeeRate);
  const [previousSelectedOption, setPreviousSelectedOption] = useState('standard');

  const [feeRateInput, setFeeRateInput] = useState(previousFeeRate);
  const [selectedOption, setSelectedOption] = useState(previousSelectedOption);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChangeFeeRate(feeRateInput);
  }, [feeRateInput, onChangeFeeRate]);

  /* callbacks */
  const handleChangeFeeRateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeeRateInput(e.target.value);
    if (selectedOption !== 'custom') {
      setSelectedOption('custom');
    }
  };

  const handleClickFeeButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedOption(e.currentTarget.value);
    if (feeRates) {
      switch (e.currentTarget.value) {
        case 'high':
          setFeeRateInput(feeRates.priority.toString());
          break;
        case 'standard':
          setFeeRateInput(feeRates.regular.toString());
          break;
        case 'custom':
          inputRef.current?.focus();
          break;
        default:
          break;
      }
    }
  };

  const handleClickClose = () => {
    // reset state
    setFeeRateInput(previousFeeRate);
    setSelectedOption(previousSelectedOption);
    onClose();
  };

  const handleClickApply = () => {
    // save state
    setPreviousFeeRate(feeRateInput);
    setPreviousSelectedOption(selectedOption);
    // apply state to parent
    onClickApply(feeRateInput);
    onClose();
  };

  const fiatFee = getBtcFiatEquivalent(new BigNumber(fee), BigNumber(btcFiatRate));

  return (
    <BottomModal
      visible={visible}
      header={t('TRANSACTION_SETTING.ADVANCED_SETTING_FEE_OPTION')}
      onClose={handleClickClose}
    >
      <Container>
        <Text>{t('TRANSACTION_SETTING.FEE_RATE')}</Text>
        <FeeContainer>
          <InputContainer withError={!!error}>
            <InputField
              type="number"
              ref={inputRef}
              value={feeRateInput?.toString()}
              onKeyDown={handleKeyDownFeeRateInput}
              onChange={handleChangeFeeRateInput}
            />
            <FeeText>sats /vB</FeeText>
            <TickerContainer>
              {isFeeLoading ? (
                <>
                  <BetterBarLoader width={75} height={16} />
                  <BetterBarLoader width={75} height={16} />
                </>
              ) : (
                <>
                  <NumericFormat
                    value={fee}
                    displayType="text"
                    thousandSeparator
                    suffix=" sats"
                    renderText={(value: string) => <FeeText>{value}</FeeText>}
                  />
                  <StyledFiatAmountText fiatAmount={fiatFee} fiatCurrency={fiatCurrency} />
                </>
              )}
            </TickerContainer>
          </InputContainer>
          <StyledInputFeedback message={error} variant="danger" />
        </FeeContainer>
        <ButtonContainer>
          {buttons.map(({ value, label }) => (
            <FeeButton
              key={value}
              value={value}
              isSelected={selectedOption === value}
              onClick={handleClickFeeButton}
            >
              {t(label)}
            </FeeButton>
          ))}
        </ButtonContainer>
        <DetailText>{t('TRANSACTION_SETTING.FEE_INFO')}</DetailText>
      </Container>
      <ApplyButtonContainer>
        <ActionButton
          text={t('TRANSACTION_SETTING.APPLY')}
          processing={isFeeLoading}
          disabled={isFeeLoading || !!error}
          onPress={handleClickApply}
        />
      </ApplyButtonContainer>
    </BottomModal>
  );
}
export default EditFees;
