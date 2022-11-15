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
import { getBtcFees, isCustomFeesAllowed } from '@secretkeylabs/xverse-core/transactions/btc';

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
  fontSize: 12,
  marginTop: props.theme.spacing(8),
}));

const TickerImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  height: 23,
  width: 26,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const SelectorContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  flex: 1,
  marginLeft: props.theme.spacing(4),
}));

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(6),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(10),
  marginBottom: props.theme.spacing(10),
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

const InputFieldContainer = styled.div(() => ({
  flex: 1,
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
  btcRecepientAddress?: string;
  amount?: BigNumber;
}
type TxType = 'STX' | 'BTC';
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
  btcRecepientAddress,
  amount,
}:Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'TRANSACTION_SETTING' });
  const [feeInput, setFeeInput] = useState(fee);
  const theme = useTheme();
  const [nonceInput, setNonceInput] = useState < string | undefined >(nonce);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState({
    label: t('STANDARD'),
    value: 'standard',
  });
  const {
    network,
    btcAddress, stxBtcRate, btcFiatRate, fiatCurrency, btcBalance, selectedAccount, seedPhrase,
  } = useSelector((state: StoreState) => state.walletState);
  const inputRef = useRef(null);
  const customStyles = {
    control: (base: any, state: { isFocused: any }) => ({
      ...base,
      background: theme.colors.background.elevation1,
      borderRadius: 8,
      color: theme.colors.white['0'],
      borderColor: theme.colors.background.elevation6,
      boxShadow: state.isFocused ? null : null,
      '&:hover': {
        borderColor: theme.colors.background.elevation2,
      },
      height: 45,
    }),
    menuList: (base: any) => ({
      ...base,
      padding: 0,
      color: theme.colors.white['0'],
      background: theme.colors.background.elevation1,
      '&:hover': {
        color: theme.colors.background.elevation1,
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      height: '100%',
      color: theme.colors.white['0'],
      paddingTop: '3px',
    }),
  };

  const StxFeeModes: { label: string; value: FeeModeType }[] = [
    {
      label: t('LOW'),
      value: 'low',
    },
    {
      label: t('STANDARD'),
      value: 'standard',
    },
    {
      label: t('HIGH'),
      value: 'high',
    },
    {
      label: t('CUSTOM'),
      value: 'custom',
    },
  ];
  const BtcFeeModes = [
    {
      label: t('STANDARD'),
      value: 'standard',
    },
    {
      label: t('HIGH'),
      value: 'high',
    },
    {
      label: t('CUSTOM'),
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

  const modifyBtcFees = async (mode: SingleValue<{ label: string; value: string; }>) => {
    try {
      setSelectedOption(mode!);
      if (mode?.value === 'custom') inputRef?.current?.focus();
      else {
        const btcFee = await getBtcFees(
          btcRecepientAddress!,
          btcAddress,
          amount?.toString()!,
          selectedAccount?.id ?? 0,
          network.type,
          seedPhrase,
          mode?.value,
        );
        setFeeInput(btcFee.toString());
      }
    } catch (err: any) {
      setError(err.toString());
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
        setError(t('SAME_FEE_ERROR'));
        return;
      } if (currentFee.gt(availableBalance)) {
        setError(t('GREATER_FEE_ERROR'));
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
      setError(t('GREATER_FEE_ERROR'));
      return;
    }
    if (selectedOption.value === 'custom') {
      const response = await isCustomFeesAllowed(feeInput.toString());
      if (!response) {
        setError(t('LOWER_THAN_MINIMUM'));
        return;
      }
    }
    setError('');
    onApplyClick(feeInput.toString());
  }

  const onInputEditFeesChange = (e: { target: { value: SetStateAction<string> } }) => {
    setFeeInput(e.target.value);
  };

  const onFeeOptionChange = (value: { label: string; value: string } | null) => (type === 'STX' ? modifyStxFees(value) : modifyBtcFees(value));

  const editFeesSection = (
    <Container>
      <Text>{t('FEE')}</Text>
      <RowContainer>
        <FeeContainer>
          <RowContainer>
            <InputContainer>
              <InputFieldContainer>
                <InputField ref={inputRef} value={feeInput} onChange={onInputEditFeesChange} />
              </InputFieldContainer>
              <TickerContainer>
                <Text>{type === 'STX' ? 'STX' : 'SATS'}</Text>
                {getTokenIcon()}
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
      <DetailText>{t('FEE_INFO')}</DetailText>
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
    <Container>
      <Text>{t('NONCE')}</Text>
      <InputContainer>
        <InputFieldContainer>
          <InputField value={nonceInput} onChange={onInputEditNonceChange} placeholder="0" />
        </InputFieldContainer>
      </InputContainer>
      <DetailText>{t('NONCE_INFO')}</DetailText>
    </Container>
  );

  return (
    <BottomModal visible={visible} header={type === 'STX' ? t('ADVANCED_SETTING') : t('EDIT_FEE')} onClose={onCrossClick}>
      {editFeesSection}
      {errorText}
      {allowEditNonce && type === 'STX' && editNonceSection}
      <ButtonContainer>
        <ActionButton
          text={t('APPLY')}
          processing={loading}
          disabled={loading}
          onPress={type === 'STX' ? applyClickForStx : applyClickForBtc}
        />
      </ButtonContainer>
    </BottomModal>
  );
}

export default TransactionSettingAlert;
