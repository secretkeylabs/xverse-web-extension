import BigNumber from 'bignumber.js';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import {
  getBtcFiatEquivalent,
  getStxFiatEquivalent,
  stxToMicrostacks,
} from '@secretkeylabs/xverse-core/currency';
import {
  SetStateAction, useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import useWalletSelector from '@hooks/useWalletSelector';
import { NumericFormat } from 'react-number-format';
import {
  getBtcFees,
  getBtcFeesForNonOrdinalBtcSend,
  getBtcFeesForOrdinalSend,
  isCustomFeesAllowed,
  Recipient,
} from '@secretkeylabs/xverse-core/transactions/btc';
import { BtcUtxoDataResponse, ErrorCodes } from '@secretkeylabs/xverse-core';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const FiatAmountText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
}));

const AmountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: 'orange',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
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
  paddingLeft: props.theme.spacing(5),
  paddingRight: props.theme.spacing(5),
  paddingTop: props.theme.spacing(5),
  paddingBottom: props.theme.spacing(5),
}));

const InputField = styled.input((props) => ({
  ...props.theme.body_m,
  backgroundColor: 'transparent',
  color: props.theme.colors.white['200'],
  border: 'transparent',
  width: '20%',
}));

const CurrencyText = styled.span((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['200'],
  marginLeft: 4,
}));

const SubText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
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
  width: 82,
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

const ApplyButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(20),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const TickerContainer = styled.div({
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
  flex: 1,
});

interface Props {
  type?: string;
  fee: string;
  btcRecipients?: Recipient[];
  ordinalTxUtxo?: BtcUtxoDataResponse;
  isRestoreFlow?: boolean;
  nonOrdinalUtxos?: BtcUtxoDataResponse[];
  setIsLoading: () => void;
  setIsNotLoading: () => void;
}
function EditFee({
  type,
  fee,
  btcRecipients,
  ordinalTxUtxo,
  isRestoreFlow,
  nonOrdinalUtxos,
  setIsLoading,
  setIsNotLoading,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'TRANSACTION_SETTING' });
  const {
    network,
    btcAddress,
    stxBtcRate,
    btcFiatRate,
    fiatCurrency,
    selectedAccount,
    ordinalsAddress,
  } = useWalletSelector();
  const [selectedOption, setSelectedOption] = useState<string>('standard');
  const [feeInput, setFeeInput] = useState(fee);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const modifyStxFees = (mode: string) => {
    const currentFee = new BigNumber(fee);
    setSelectedOption(mode);
    switch (mode) {
      case 'low':
        setFeeInput(currentFee.dividedBy(2).toString());
        break;
      case 'standard':
        setFeeInput(currentFee.toString());
        break;
      case 'high':
        setFeeInput(currentFee.multipliedBy(2).toString());
        break;
      case 'custom':
        inputRef.current?.focus();
        break;
      default:
        break;
    }
  };

  const modifyFees = async (mode: string) => {
    try {
      setSelectedOption(mode);
      setIsLoading();
      if (mode === 'custom') inputRef?.current?.focus();
      else if (type === 'BTC') {
        if (isRestoreFlow) {
          const btcFee = await getBtcFeesForNonOrdinalBtcSend(
            btcAddress,
            nonOrdinalUtxos!,
            ordinalsAddress,
            'Mainnet',
            mode?.value,
          );
          setFeeInput(btcFee.toString());
        } else if (btcRecipients && selectedAccount) {
          const btcFee = await getBtcFees(btcRecipients, btcAddress, network.type, mode?.value);
          setFeeInput(btcFee.toString());
        }
      } else if (type === 'Ordinals') {
        if (btcRecipients && ordinalTxUtxo) {
          const txFees = await getBtcFeesForOrdinalSend(
            btcRecipients[0].address,
            ordinalTxUtxo,
            btcAddress,
            network.type,
            mode,
          );
          setFeeInput(txFees.toString());
        }
      }
      setIsNotLoading();
    } catch (err: any) {
      if (Number(error) === ErrorCodes.InSufficientBalance) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
      } else setError(error.toString());
    }
  };

  useEffect(() => {
    if (type === 'STX' && selectedOption !== 'custom') {
      modifyStxFees(selectedOption);
    }
  }, [selectedOption]);

  function getFiatEquivalent() {
    return type === 'STX'
      ? getStxFiatEquivalent(stxToMicrostacks(new BigNumber(feeInput)), stxBtcRate, btcFiatRate)
      : getBtcFiatEquivalent(new BigNumber(fee), btcFiatRate);
  }

  const getFiatAmountString = (fiatAmount: BigNumber) => {
    if (fiatAmount) {
      if (fiatAmount.isLessThan(0.01)) {
        return `<${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`;
      }
      return (
        <NumericFormat
          value={fiatAmount.toFixed(2).toString()}
          displayType="text"
          thousandSeparator
          prefix={`${currencySymbolMap[fiatCurrency]} `}
          suffix={` ${fiatCurrency}`}
          renderText={(value: string) => <FiatAmountText>{value}</FiatAmountText>}
        />
      );
    }
    return '';
  };

  const onInputEditFeesChange = (e: { target: { value: SetStateAction<string> } }) => {
    setFeeInput(e.target.value);
  };

  return (
    <Container>
      <Text>{t('FEE')}</Text>
      <FeeContainer>
        <InputContainer>
          <InputField ref={inputRef} value={feeInput} onChange={onInputEditFeesChange} />
          <CurrencyText>{`${type === 'STX' ? 'STX' : 'sats'}`}</CurrencyText>
          <TickerContainer>
            <SubText>{getFiatAmountString(getFiatEquivalent())}</SubText>
          </TickerContainer>
        </InputContainer>
      </FeeContainer>
      <ButtonContainer>
        {type === 'STX' && (
        <FeeButton isSelected={selectedOption === 'low'} onClick={() => modifyStxFees('low')}>
          {t('LOW')}
        </FeeButton>
        )}
        <FeeButton
          isSelected={selectedOption === 'standard'}
          onClick={() => (type === 'STX' ? modifyStxFees('standard') : modifyFees('standard'))}
        >
          {t('STANDARD')}
        </FeeButton>
        <FeeButton
          isSelected={selectedOption === 'high'}
          onClick={() => (type === 'STX' ? modifyStxFees('high') : modifyFees('high'))}
        >
          {t('HIGH')}
        </FeeButton>
        <FeeButton
          isSelected={selectedOption === 'custom'}
          isLastInRow
          onClick={() => (type === 'STX' ? modifyStxFees('custom') : modifyFees('custom'))}
        >
          {t('CUSTOM')}
        </FeeButton>
      </ButtonContainer>
      <DetailText>{t('FEE_INFO')}</DetailText>
    </Container>
  );
}

export default EditFee;
