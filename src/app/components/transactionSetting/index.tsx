import BottomModal from '@components/bottomModal';
import BigNumber from 'bignumber.js';
import {
  SetStateAction, useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import Select, { SingleValue } from 'react-select';
import styled, { useTheme } from 'styled-components';
import IconSats from '@assets/img/send/ic_sats_ticker.svg';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import { NumericFormat } from 'react-number-format';
import ActionButton from '@components/button';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import {
  getBtcFiatEquivalent, getStxFiatEquivalent, stxToMicrostacks,
} from '@secretkeylabs/xverse-core/currency';
import { useSelector } from 'react-redux';
import { StoreState } from '@stores/index';
import { getBtcFees, getBtcFeesForOrdinalSend, isCustomFeesAllowed, Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import { btcToSats, BtcUtxoDataResponse, ErrorCodes } from '@secretkeylabs/xverse-core';

const Text = styled.h1((props) => ({
  ...props.theme.body_medium_m,
}));

const TickerContainer = styled.div({
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
});

const FiatAmountText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
}));

const SubText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
}));

const DetailText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['200'],
  marginTop: props.theme.spacing(8),
}));

const TickerImage = styled.img((props) => ({
  marginLeft: props.theme.spacing(5),
  alignSelf: 'center',
  height: 24,
  width: 24,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const SelectorContainer = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
  width: 148,
  justifyContent: 'flex-end',
});

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(8),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const NonceContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(16),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(22),
  marginBottom: props.theme.spacing(20),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const FeeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const InputField = styled.input((props) => ({
  ...props.theme.body_m,
  backgroundColor: props.theme.colors.background.elevation1,
  color: props.theme.colors.white['400'],
  width: '100%',
  border: 'transparent',
}));

const InputContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  border: `1px solid ${props.theme.colors.background.elevation6}`,
  backgroundColor: props.theme.colors.background.elevation1,
  borderRadius: 8,
  paddingLeft: props.theme.spacing(5),
  paddingRight: props.theme.spacing(5),
  paddingTop: props.theme.spacing(5),
  paddingBottom: props.theme.spacing(5),
}));

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(8),
  marginLeft: props.theme.spacing(10),
  marginRight: props.theme.spacing(10),
}));

const ErrorText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.feedback.error,
}));
interface Props {
  visible: boolean;
  fee: string;
  loading?: boolean;
  nonce?: string;
  onApplyClick: (fee: string, nonce?: string) => void;
  onCrossClick: () => void;
  previousFee?: string;
  availableBalance?: BigNumber;
  allowEditNonce?: boolean;
  type?: TxType;
  btcRecipients: Recipient[];
  ordinalTxUtxo?: BtcUtxoDataResponse;
}
type TxType = 'STX' | 'BTC' | 'Ordinals';
type FeeModeType = 'low' | 'standard' | 'high' | 'custom';

function TransactionSettingAlert({
  visible,
  fee,
  loading,
  nonce,
  onApplyClick,
  onCrossClick,
  previousFee,
  availableBalance,
  allowEditNonce = true,
  type = 'STX',
  btcRecipients,
  ordinalTxUtxo,
}:Props) {
  const { t } = useTranslation('translation');
  const [feeInput, setFeeInput] = useState(fee);
  const theme = useTheme();
  const [nonceInput, setNonceInput] = useState < string | undefined >(nonce);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(loading);
  const [selectedOption, setSelectedOption] = useState({
    label: t('TRANSACTION_SETTING.STANDARD'),
    value: 'standard',
  });
  const {
    network,
    btcAddress, stxBtcRate, btcFiatRate, fiatCurrency, btcBalance, selectedAccount, seedPhrase,
  } = useSelector((state: StoreState) => state.walletState);
  const inputRef = useRef(null);
  const customStyles = {
    control: (base: any, state: { isFocused: boolean, isSelected: boolean }) => ({
      ...base,
      ...theme.body_medium_m,
      background: theme.colors.background.elevation1,
      borderRadius: 8,
      color: theme.colors.white['400'],
      borderColor: theme.colors.background.elevation6,
      boxShadow: state.isFocused ? null : null,
      '&:hover': {
        borderColor: theme.colors.background.elevation2,
      },
      height: 45,
    }),
    option: (base: any, state: { isFocused: boolean, isSelected: boolean }) => ({
      ...base,
      background: state.isFocused ? 'rgba(255, 255, 255, 0.09)' : '#3C3F60',
    }),
    menuList: (base: any) => ({
      ...base,
      padding: 0,
      ...theme.body_medium_m,
      color: theme.colors.white['0'],
      background: '#3C3F60',
      '&:hover': {
        color: theme.colors.white['0'],
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      ...theme.body_medium_m,
      height: '100%',
      color: theme.colors.white['200'],
      paddingTop: '3px',
    }),
  };

  const StxFeeModes: { label: string; value: FeeModeType }[] = [
    {
      label: t('TRANSACTION_SETTING.LOW'),
      value: 'low',
    },
    {
      label: t('TRANSACTION_SETTING.STANDARD'),
      value: 'standard',
    },
    {
      label: t('TRANSACTION_SETTING.HIGH'),
      value: 'high',
    },
    {
      label: t('TRANSACTION_SETTING.CUSTOM'),
      value: 'custom',
    },
  ];
  const BtcFeeModes = [
    {
      label: t('TRANSACTION_SETTING.STANDARD'),
      value: 'standard',
    },
    {
      label: t('TRANSACTION_SETTING.HIGH'),
      value: 'high',
    },
    {
      label: t('TRANSACTION_SETTING.CUSTOM'),
      value: 'custom',
    },
  ];

  const modifyStxFees = (mode: SingleValue<{ label: string; value: string; }>) => {
    const currentFee = new BigNumber(fee);

    switch (mode?.value) {
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

  useEffect(() => {
    if (type === 'STX' && selectedOption.value !== 'custom') {
      modifyStxFees(selectedOption);
    }
  }, [selectedOption]);

  const modifyFees = async (mode: SingleValue<{ label: string; value: string; }>) => {
    try {
      setSelectedOption(mode!);
      setIsLoading(true);
      if (mode?.value === 'custom') inputRef?.current?.focus();
      else if (type === 'BTC') {
        if (btcRecipients && selectedAccount) {
          const btcFee = await getBtcFees(
            btcRecipients,
            btcAddress,
            network.type,
            mode?.value,
          );
          setFeeInput(btcFee.toString());
        }
      } else if (type === 'Ordinals') {
        if (btcRecipients && ordinalTxUtxo) {
          const txFees = await getBtcFeesForOrdinalSend(
            btcRecipients[0].address,
            ordinalTxUtxo,
            btcAddress,
            network.type,
            mode?.value,
          );
          setFeeInput(txFees.toString());
        }
      }
      setIsLoading(false);
    } catch (err: any) {
      if (Number(error) === ErrorCodes.InSufficientBalance) { setError(t('TX_ERRORS.INSUFFICIENT_BALANCE')); } else setError(error.toString());
    }
  };

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
  function getTokenIcon() {
    if (type === 'STX') {
      return <TickerImage src={IconStacks} />;
    } if (type === 'BTC') {
      return <TickerImage src={IconSats} />;
    }
  }
  function applyClickForStx() {
    if (previousFee && availableBalance) {
      const prevFee = stxToMicrostacks(new BigNumber(previousFee));
      const currentFee = stxToMicrostacks(new BigNumber(feeInput));
      if (currentFee.isEqualTo(prevFee)) {
        setError(t('TRANSACTION_SETTING.SAME_FEE_ERROR'));
        return;
      } if (currentFee.gt(availableBalance)) {
        setError(t('TRANSACTION_SETTING.GREATER_FEE_ERROR'));
        return;
      }
    }
    setError('');
    onApplyClick(feeInput.toString(), nonceInput);
  }

  async function applyClickForBtc() {
    const currentFee = new BigNumber(feeInput);
    if (btcBalance && currentFee.gt(btcBalance)) {
      // show fee exceeds total balance error
      setError(t('TRANSACTION_SETTING.GREATER_FEE_ERROR'));
      return;
    }
    if (selectedOption.value === 'custom') {
      const response = await isCustomFeesAllowed(feeInput.toString());
      if (!response) {
        setError(t('TRANSACTION_SETTING.LOWER_THAN_MINIMUM'));
        return;
      }
    }
    setError('');
    onApplyClick(feeInput.toString());
  }

  const onInputEditFeesChange = (e: { target: { value: SetStateAction<string> } }) => {
    setFeeInput(e.target.value);
  };

  const onFeeOptionChange = (value: { label: string; value: string } | null) => (type === 'STX' ? modifyStxFees(value) : modifyFees(value));

  const editFeesSection = (
    <Container>
      <Text>{t('TRANSACTION_SETTING.FEE')}</Text>
      <RowContainer>
        <FeeContainer>
          <RowContainer>
            <InputContainer>
              <InputField ref={inputRef} value={feeInput} onChange={onInputEditFeesChange} />
              <TickerContainer>
                {getTokenIcon()}
                <Text>{type === 'STX' ? 'STX' : 'SATS'}</Text>
              </TickerContainer>
            </InputContainer>
            <SelectorContainer>
              <Select
                defaultValue={selectedOption}
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                onChange={onFeeOptionChange}
                styles={customStyles}
                options={type === 'STX' ? StxFeeModes : BtcFeeModes}
              />
            </SelectorContainer>
          </RowContainer>
          <SubText>{getFiatAmountString(getFiatEquivalent())}</SubText>
        </FeeContainer>
      </RowContainer>
      <DetailText>{t('TRANSACTION_SETTING.FEE_INFO')}</DetailText>
    </Container>
  );

  const errorText = !!error && (
    <ErrorContainer>
      <ErrorText>{error}</ErrorText>
    </ErrorContainer>
  );

  const onInputEditNonceChange = (e: { target: { value: SetStateAction<string> } }) => {
    setNonceInput(e.target.value);
  };

  const editNonceSection = (
    <NonceContainer>
      <Text>{t('TRANSACTION_SETTING.NONCE')}</Text>
      <InputContainer>
        <InputField value={nonceInput} onChange={onInputEditNonceChange} placeholder="0" />
      </InputContainer>
      <DetailText>{t('TRANSACTION_SETTING.NONCE_INFO')}</DetailText>
    </NonceContainer>
  );

  return (
    <BottomModal visible={visible} header={type === 'STX' ? t('TRANSACTION_SETTING.ADVANCED_SETTING') : t('TRANSACTION_SETTING.EDIT_FEE')} onClose={onCrossClick}>
      {editFeesSection}
      {errorText}
      {allowEditNonce && type === 'STX' && editNonceSection}
      <ButtonContainer>
        <ActionButton
          text={t('TRANSACTION_SETTING.APPLY')}
          processing={isLoading}
          disabled={isLoading}
          onPress={type === 'STX' ? applyClickForStx : applyClickForBtc}
        />
      </ButtonContainer>
    </BottomModal>
  );
}

export default TransactionSettingAlert;
