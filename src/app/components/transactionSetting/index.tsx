import BottomModal from '@components/bottomModal';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import styled from 'styled-components';
import IconSats from '@assets/img/send/ic_sats_ticker.svg';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import { getBtcFiatEquivalent, getStxFiatEquivalent, stxToMicrostacks } from '@utils/walletUtils';
import { NumericFormat } from 'react-number-format';
import ActionButton from '@components/button';
import Theme from 'theme';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';

const Text = styled.h1((props) => ({
  ...props.theme.body_medium_m,
}));

const TickerContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
}));

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

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

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

const FeeContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
}));

const InputField = styled.input((props) => ({
  backgroundColor: props.theme.colors.background.elevation1,
  color: props.theme.colors.white['400'],
  font: props.theme.body_m,
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

const customStyles = {
  control: (base: any, state: { isFocused: any }) => ({
    ...base,
    background: Theme.colors.background.elevation1,
    borderRadius: 8,
    color: Theme.colors.white['0'],
    borderColor: Theme.colors.background.elevation6,
    boxShadow: state.isFocused ? null : null,
    '&:hover': {
      // Overwrittes the different states of border
      borderColor: Theme.colors.background.elevation6,
    },
    height: 45,
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 0,
    marginTop: 0,
    color: Theme.colors.white['0'],
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
    color: Theme.colors.white['0'],
    background: Theme.colors.background.elevation1,
  }),
  singleValue: (provided: any) => ({
    ...provided,
    height: '100%',
    color: Theme.colors.white['0'],
    paddingTop: '3px',
  }),
};

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
  amount?: string;
}
type TxType = 'STX' | 'BTC';
type FeeModeType = 'low' | 'standard' | 'high' | 'custom';

const TransactionSettingAlert: React.FC<Props> = ({
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
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'TRANSACTION_SETTING' });
  const [feeInput, setFeeInput] = useState(fee);
  const [nonceInput, setNonceInput] = useState(nonce);
  const [feeMode, setFeeMode] = useState<FeeModeType>('standard');
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState({
    label: t('STANDARD'),
    value: 'standard',
  });
  const stxBtcRate = new BigNumber(0.00001686);
  const btcFiatRate = new BigNumber(18935.735);
  const fiatCurrency = 'USD';
  const selectedAccount = '';
  const btcBalance = 0;

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
  const BtcFeeModes: { label: string; value: FeeModeType }[] = [
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

  useEffect(() => {
    if (type === 'STX' && feeMode !== 'custom') {
      modifyStxFees(feeMode);
    }
  }, [feeMode]);

  const modifyStxFees = (mode: FeeModeType) => {
    const currentFee = new BigNumber(fee);

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
        // inputRef.current?.focus();
        break;
    }
  };

  const modifyBtcFees = async (mode: FeeModeType) => {
    /* try {
          const parsedAmount = satsToBtc(new BigNumber(amount!));
          if (mode === 'custom') inputRef.current?.focus();
          else {
            const fee = await getBtcFees(
              btcRecepientAddress!,
              selectedAccount?.btcAddress!,
              parsedAmount.toString(),
              selectedAccount?.id!,
              mode,
            );
            setFeeInput(fee.toString());
          }
        } catch (error) {
          console.error(error);
        }*/
  };
  function getFiatEquivalent() {
    return type === 'STX'
      ? getStxFiatEquivalent(stxToMicrostacks(new BigNumber(feeInput)), stxBtcRate, btcFiatRate)
      : getBtcFiatEquivalent(new BigNumber(fee), btcFiatRate);
  }

  const getFiatAmountString = (fiatAmount: BigNumber, fiatCurrency: string) => {
    if (fiatAmount) {
      if (fiatAmount.isLessThan(0.01)) {
        return `<${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`;
      } else {
        return (
          <NumericFormat
            value={fiatAmount.toFixed(2).toString()}
            displayType={'text'}
            thousandSeparator={true}
            prefix={`${currencySymbolMap[fiatCurrency]} `}
            suffix={` ${fiatCurrency}`}
            renderText={(value: string) => <FiatAmountText>{value}</FiatAmountText>}
          />
        );
      }
    } else {
      return '';
    }
  };
  function getTokenIcon() {
    if (type == 'STX') {
      return <TickerImage src={IconStacks} />;
    } else if (type == 'BTC') {
      return <TickerImage src={IconSats} />;
    }
  }
  function renderEnterAmountSection() {
    return (
      <FeeContainer>
        <RowContainer>
          <InputContainer>
            <InputFieldContainer>
              <InputField value={amount} placeholder="0" />
            </InputFieldContainer>
            <TickerContainer>
              <Text>{type}</Text>
              {getTokenIcon()}
            </TickerContainer>
          </InputContainer>
          <SelectorContainer>
            <Select
              defaultValue={selectedOption}
              onChange={setSelectedOption}
              styles={customStyles}
              menuColor="red"
              options={type === 'STX' ? StxFeeModes : BtcFeeModes}
            />
          </SelectorContainer>
        </RowContainer>

        <SubText>{getFiatAmountString(getFiatEquivalent(), fiatCurrency)}</SubText>
      </FeeContainer>
    );
  }

  function renderFeesSection() {
    return (
      <Container>
        <Text>{t('FEE')}</Text>
        <RowContainer>{renderEnterAmountSection()}</RowContainer>
        <DetailText>{t('FEE_INFO')}</DetailText>
      </Container>
    );
  }

  function renderNonceSection() {
    return (
      <Container>
        <Text>{t('NONCE')}</Text>
        <InputContainer>
          <InputFieldContainer>
            <InputField value={amount} placeholder="0" />
          </InputFieldContainer>
        </InputContainer>
        <DetailText>{t('NONCE_INFO')}</DetailText>
      </Container>
    );
  }
  function renderButton() {
    return (
      <ButtonContainer onClick={onApplyClick}>
        <ActionButton text={t('APPLY')} onPress={() => {}} />
      </ButtonContainer>
    );
  }

  return (
    <BottomModal visible={visible} header={t('ADVANCED_SETTING')} onClose={onCrossClick}>
      {renderFeesSection()}
      {allowEditNonce && type === 'STX' && renderNonceSection()}
      {renderButton()}
    </BottomModal>
  );
};

export default TransactionSettingAlert;
