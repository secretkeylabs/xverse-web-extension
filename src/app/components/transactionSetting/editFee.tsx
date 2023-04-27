import Select, { SingleValue } from 'react-select';
import IconSats from '@assets/img/send/ic_sats_ticker.svg';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import BigNumber from 'bignumber.js';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import {
  getBtcFiatEquivalent, getStxFiatEquivalent, stxToMicrostacks,
} from '@secretkeylabs/xverse-core/currency';
import { SetStateAction, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import useWalletSelector from '@hooks/useWalletSelector';
import { NumericFormat } from 'react-number-format';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const TickerImage = styled.img((props) => ({
  marginLeft: props.theme.spacing(5),
  alignSelf: 'center',
  height: 24,
  width: 24,
}));

const FiatAmountText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
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
  backgroundColor: props.theme.colors.background.elevation1,
  color: props.theme.colors.white['400'],
  width: '100%',
  border: 'transparent',
}));

const SubText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const FeeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const TickerContainer = styled.div({
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
});

const SelectorContainer = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
  width: 148,
  justifyContent: 'flex-end',
});

interface Props {
  type?: string;
  fee: string;
}
function EditFee({ type, fee }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'TRANSACTION_SETTING' });
  const {
    network,
    btcAddress, stxBtcRate, btcFiatRate, fiatCurrency, btcBalance, selectedAccount, ordinalsAddress,
  } = useWalletSelector();
  const [feeInput, setFeeInput] = useState(fee);
  const [selectedOption, setSelectedOption] = useState({
    label: t('STANDARD'),
    value: 'standard',
  });
  const inputRef = useRef(null);
  const theme = useTheme();

  type TxType = 'STX' | 'BTC' | 'Ordinals';
type FeeModeType = 'low' | 'standard' | 'high' | 'custom';
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

function getFiatEquivalent() {
  return type === 'STX'
    ? getStxFiatEquivalent(stxToMicrostacks(new BigNumber(feeInput)), stxBtcRate, btcFiatRate)
    : getBtcFiatEquivalent(new BigNumber(fee), btcFiatRate);
}
const onFeeOptionChange = (value: { label: string; value: string } | null) => (type === 'STX' ? modifyStxFees(value) : modifyFees(value));

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

const onInputEditFeesChange = (e: { target: { value: SetStateAction<string> } }) => {
  setFeeInput(e.target.value);
};

return (
  <Container>
    <Text>{t('FEE')}</Text>
    <FeeContainer>
      <InputContainer>
        <InputField ref={inputRef} value={feeInput} onChange={onInputEditFeesChange} />
        <TickerContainer>
          <SubText>{getFiatAmountString(getFiatEquivalent())}</SubText>
        </TickerContainer>
      </InputContainer>
    </FeeContainer>
    <DetailText>{t('FEE_INFO')}</DetailText>
  </Container>
);
}

export default EditFee;
