import ActionButton from '@components/button';
import BigNumber from 'bignumber.js';
import BottomModal from '@components/bottomModal';
import styled from 'styled-components';
import useWalletSelector from '@hooks/useWalletSelector';
import { NumericFormat } from 'react-number-format';
import { SupportedCurrency } from '@secretkeylabs/xverse-core';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core/currency';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useBtcFeeRate from '@hooks/useBtcFeeRate';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(2),
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

const InputContainer = styled.div<{ withError?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(6),
  border: `1px solid ${
    props.withError ? props.theme.colors.feedback.error : props.theme.colors.background.elevation6
  }`,
  backgroundColor: props.theme.colors.background.elevation1,
  borderRadius: 8,
  paddingLeft: props.theme.spacing(5),
  paddingRight: props.theme.spacing(5),
  paddingTop: props.theme.spacing(5),
  paddingBottom: props.theme.spacing(5),
}));

const InputField = styled.input((props) => ({
  ...props.theme.body_m,
  backgroundColor: 'transparent',
  color: props.theme.colors.white['0'],
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
  color: props.theme.colors.white['0'],
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
  color: `${
    props.isSelected ? props.theme.colors.background.elevation2 : props.theme.colors.white['400']
  }`,
  background: `${props.isSelected ? props.theme.colors.white : 'transparent'}`,
  border: `1px solid ${
    props.isSelected ? 'transparent' : props.theme.colors.background.elevation6
  }`,
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
});

const ApplyButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 16px 40px;
`;

const ErrorText = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.feedback.error,
  marginBottom: props.theme.spacing(2),
}));

// TODO move this to component file
const FiatAmountText = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
}));
function FiatAmount({
  fiatAmount,
  fiatCurrency,
}: {
  fiatAmount: BigNumber;
  fiatCurrency: SupportedCurrency;
}) {
  if (!fiatAmount || !fiatCurrency) {
    return null;
  }
  return (
    <FiatAmountText>
      <NumericFormat
        value={fiatAmount.lt(0.01) ? '0.01' : fiatAmount.toFixed(2).toString()}
        displayType="text"
        thousandSeparator
        prefix={`${fiatAmount.lt(0.01) ? '<' : '~'} ${currencySymbolMap[fiatCurrency]}`}
        suffix={` ${fiatCurrency}`}
      />
    </FiatAmountText>
  );
}

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
  initialFeeRate: number;
  isFeeLoading: boolean;
  error: string;
}) {
  const { t } = useTranslation('translation');
  const { btcFiatRate, fiatCurrency } = useWalletSelector();
  const { data: feeRates } = useBtcFeeRate();

  const [selectedOption, setSelectedOption] = useState('standard');
  const [feeRateInput, setFeeRateInput] = useState(initialFeeRate?.toString() ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChangeFeeRate(feeRateInput);
  }, [feeRateInput, onChangeFeeRate]);

  /* callbacks */
  const onChangeEditFeesInput = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleClickApply = () => {
    onClickApply(feeRateInput);
    onClose();
  };

  const fiatFee = getBtcFiatEquivalent(new BigNumber(fee), btcFiatRate);

  return (
    <BottomModal
      visible={visible}
      header={t('TRANSACTION_SETTING.ADVANCED_SETTING_FEE_OPTION')}
      onClose={onClose}
    >
      <Container>
        <Text>{t('TRANSACTION_SETTING.FEE')}</Text>
        <FeeContainer>
          <InputContainer withError={!!error}>
            <InputField
              type="number"
              ref={inputRef}
              value={feeRateInput?.toString()}
              onChange={onChangeEditFeesInput}
            />
            <FeeText>sats /vB</FeeText>
            {isFeeLoading ? (
              // TODO use skeleton
              'loading...'
            ) : (
              <TickerContainer>
                <NumericFormat
                  value={fee}
                  displayType="text"
                  thousandSeparator
                  suffix=" sats"
                  renderText={(value: string) => <FeeText>{value}</FeeText>}
                />
                <FiatAmount fiatAmount={fiatFee} fiatCurrency={fiatCurrency} />
              </TickerContainer>
            )}
          </InputContainer>
          <ErrorText>{error}</ErrorText>
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
