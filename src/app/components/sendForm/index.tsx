import { CurrencyTypes } from '@utils/constants';
import { FungibleToken } from '@secretkeylabs/xverse-core/types';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  ReactNode, SetStateAction, useEffect, useState,
} from 'react';
import { getTicker } from '@utils/helper';
import { StoreState } from '@stores/index';
import { useSelector } from 'react-redux';
import Info from '@assets/img/info.svg';
import Switch from '@assets/img/send/switch.svg';
import ActionButton from '@components/button';
import { useNavigate } from 'react-router-dom';
import { useBnsName, useBNSResolver, useDebounce } from '@hooks/queries/useBnsName';
import { getFiatEquivalent } from '@secretkeylabs/xverse-core/transactions';
import InfoContainer from '@components/infoContainer';
import useNetworkSelector from '@hooks/useNetwork';
import TokenImage from '@components/tokenImage';
import { getBtcEquivalent, getStxTokenEquivalent } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import { getCurrencyFlag } from '@utils/currency';

interface ContainerProps {
  error: boolean;
}
const ScrollContainer = styled.div`
  display: flex;
  flex:1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  margin-left: 5%;
  margin-right: 5%;
`;

const OuterContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: props.theme.spacing(32.5),
  flex: 1,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(16),
}));

const OrdinalInfoContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(6),
}));

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(3),
}));

const MemoContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(3),
  marginBottom: props.theme.spacing(6),
}));

const ErrorText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.feedback.error,
}));

const InputFieldContainer = styled.div(() => ({
  flex: 1,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  flex: 1,
  display: 'flex',
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_medium_m,
}));

const SubText = styled.h1((props) => ({
  ...props.theme.body_xs,
  display: 'flex',
  flex: 1,
  color: props.theme.colors.white['400'],
}));

const AssociatedText = styled.h1((props) => ({
  ...props.theme.body_xs,
  wordWrap: 'break-word',
}));

const BalanceText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['400'],
  marginRight: props.theme.spacing(2),
}));

const InputField = styled.input((props) => ({
  ...props.theme.body_m,
  backgroundColor: props.theme.colors.background['elevation-1'],
  color: props.theme.colors.white['0'],
  width: '100%',
  border: 'transparent',
}));

const AmountInputContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  border: props.error ? '1px solid rgba(211, 60, 60, 0.3)' : `1px solid ${props.theme.colors.background.elevation3}`,
  backgroundColor: props.theme.colors.background['elevation-1'],
  borderRadius: 8,
  paddingLeft: props.theme.spacing(5),
  paddingRight: props.theme.spacing(5),
  height: 44,
  ':focus-within': {
    border: `1px solid ${props.theme.colors.background.elevation6}`,
  },
}));

const MemoInputContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  border: props.error ? '1px solid rgba(211, 60, 60, 0.3)' : `1px solid ${props.theme.colors.background.elevation3}`,
  backgroundColor: props.theme.colors.background['elevation-1'],
  borderRadius: 8,
  padding: props.theme.spacing(7),
  height: 76,
  ':focus-within': {
    border: `1px solid ${props.theme.colors.background.elevation6}`,
  },
}));

interface ButtonProps {
  enabled: boolean;
}

const SendButtonContainer = styled.div<ButtonProps>((props) => ({
  paddingBottom: props.theme.spacing(12),
  paddingTop: props.theme.spacing(4),
  marginLeft: '5%',
  marginRight: '5%',
  opacity: props.enabled ? 1 : 0.6,
}));

const BuyCryptoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  borderRadius: 12,
  alignItems: 'flex-start',
  backgroundColor: 'transparent',
  padding: props.theme.spacing(8),
  marginTop: props.theme.spacing(11),
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const BuyCryptoText = styled.h1((props) => ({
  ...props.theme.body_xs,
  marginBottom: props.theme.spacing(2),
  color: props.theme.colors.white['400'],
}));

const BuyCryptoRedirectText = styled.h1((props) => ({
  ...props.theme.tile_text,
  fontSize: 12,
}));

const BuyCryptoRedirectButton = styled.button((props) => ({
  backgroundColor: 'transparent',
  color: props.theme.colors.white['0'],
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
}));

const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
}));

const SwitchToFiatButton = styled.button((props) => ({
  backgroundColor: props.theme.colors.background.elevation0,
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  borderRadius: 24,
  display: 'flex',
  padding: '8px 12px',
  justifyContent: 'center',
  alignItems: 'center',
}));

const SwitchToFiatText = styled.h1((props) => ({
  ...props.theme.body_xs,
  marginLeft: props.theme.spacing(2),
  color: props.theme.colors.white['0'],
}));

const CurrencyFlag = styled.img((props) => ({
  marginLeft: props.theme.spacing(4),
}));

const TokenContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(8),
}));

interface Props {
  onPressSend: (recipientID: string, amount: string, memo?: string) => void;
  currencyType: CurrencyTypes;
  amountError?: string;
  recepientError?: string;
  memoError?: string;
  fungibleToken?: FungibleToken;
  disableAmountInput?: boolean;
  balance?: number;
  hideMemo?: boolean;
  buttonText?: string;
  processing?: boolean;
  children?: ReactNode;
  recipient?: string;
  amountToSend? : string;
  stxMemo? : string;
}

function SendForm({
  onPressSend,
  currencyType,
  amountError,
  recepientError,
  memoError,
  fungibleToken,
  disableAmountInput,
  balance,
  hideMemo = false,
  buttonText,
  processing,
  children,
  recipient,
  amountToSend,
  stxMemo,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const [amount, setAmount] = useState(amountToSend ?? '');
  const [memo, setMemo] = useState(stxMemo ?? '');
  const [fiatAmount, setFiatAmount] = useState<string | undefined>('0');
  const [switchToFiat, setSwitchToFiat] = useState(false);
  const [addressError, setAddressError] = useState<string | undefined>(recepientError);
  const [recipientAddress, setRecipientAddress] = useState(recipient ?? '');
  const navigate = useNavigate();

  const {
    stxBtcRate, btcFiatRate, fiatCurrency, stxAddress,
  } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const network = useNetworkSelector();
  const debouncedSearchTerm = useDebounce(recipientAddress, 300);
  const associatedBnsName = useBnsName(recipientAddress, network);
  const associatedAddress = useBNSResolver(
    debouncedSearchTerm,
    stxAddress,
    currencyType,
  );

  useEffect(() => {
    if (recepientError) {
      if (associatedAddress !== '' && recepientError.includes(t('ERRORS.ADDRESS_INVALID'))) {
        setAddressError('');
      } else {
        setAddressError(recepientError);
      }
    }
  }, [recepientError, associatedAddress]);

  function getTokenCurrency() {
    if (fungibleToken) {
      if (fungibleToken?.ticker) {
        return fungibleToken.ticker.toUpperCase();
      }
      if (fungibleToken?.name) {
        return getTicker(fungibleToken.name).toUpperCase();
      }
    } else {
      return currencyType;
    }
  }

  const onSwitchPress = () => {
    setSwitchToFiat(!switchToFiat);
  };

  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;

    const resultRegex = /^\d*\.?\d*$/;
    if (!resultRegex.test(newValue)) {
      setAmount('');
    } else {
      setAmount(newValue);
    }

    const amountInCurrency = getFiatEquivalent(Number(newValue), currencyType, stxBtcRate, btcFiatRate, fungibleToken);
    setFiatAmount(amountInCurrency);
  };

  function getTokenEquivalent(amount: string) {
    if (
      (currencyType === 'FT' && !fungibleToken?.tokenFiatRate)
      || currencyType === 'NFT'
    ) { return ''; }
    if (!amount) return '0';
    switch (currencyType) {
      case 'STX':
        return getStxTokenEquivalent(
          new BigNumber(amount),
          stxBtcRate,
          btcFiatRate,
        )
          .toFixed(6)
          .toString();
      case 'BTC':
        return getBtcEquivalent(new BigNumber(amount), btcFiatRate)
          .toFixed(8)
          .toString();
      case 'FT':
        if (fungibleToken?.tokenFiatRate) {
          return new BigNumber(amount)
            .dividedBy(fungibleToken.tokenFiatRate)
            .toFixed(fungibleToken.decimals ?? 2)
            .toString();
        }
      default:
        return '';
    }
  }

  const getAmountLabel = () => {
    if (switchToFiat) return fiatCurrency;
    return getTokenCurrency();
  };

  const renderEnterAmountSection = (
    <Container>
      <RowContainer>
        <TitleText>{t('AMOUNT')}</TitleText>
        <BalanceText>
          {t('BALANCE')}
          :
        </BalanceText>
        <Text>{balance}</Text>
      </RowContainer>
      <AmountInputContainer error={amountError !== ''}>
        <InputFieldContainer>
          <InputField value={amount} placeholder="0" onChange={onInputChange} />
        </InputFieldContainer>
        <Text>{getAmountLabel()}</Text>
        {switchToFiat && <CurrencyFlag src={getCurrencyFlag(fiatCurrency)} />}
      </AmountInputContainer>
      <RowContainer>
        <SubText>
          {switchToFiat ? (
            <NumericFormat
              value={getTokenEquivalent(amount)}
              displayType="text"
              thousandSeparator
              renderText={(value) => (`~ ${value} ${getTokenCurrency()}`)}
            />
          )
            : `~ $ ${fiatAmount} ${fiatCurrency}`}

        </SubText>
        <SwitchToFiatButton onClick={onSwitchPress}>
          <img src={Switch} alt="Switch" />
          <SwitchToFiatText>
            {switchToFiat
              ? `${t('SWITCH_TO')} ${getTokenCurrency()}`
              : `${t('SWITCH_TO')} ${fiatCurrency}`}
          </SwitchToFiatText>
        </SwitchToFiatButton>
      </RowContainer>
    </Container>
  );

  const onAddressInputChange = (e: { target: { value: SetStateAction<string> } }) => {
    setRecipientAddress(e.target.value);
  };

  const renderEnterRecipientSection = (
    <Container>
      <TitleText>{t('RECIPIENT')}</TitleText>
      <AmountInputContainer error={addressError !== ''}>
        <InputFieldContainer>
          <InputField
            value={recipientAddress}
            placeholder={currencyType === 'BTC' || currencyType === 'Ordinal' ? t('BTC_RECIPIENT_PLACEHOLDER') : t('RECIPIENT_PLACEHOLDER')}
            onChange={onAddressInputChange}
          />
        </InputFieldContainer>
      </AmountInputContainer>
      {associatedAddress && currencyType !== 'BTC' && currencyType !== 'Ordinal' && (
        <>
          <SubText>{t('ASSOCIATED_ADDRESS')}</SubText>
          <AssociatedText>{associatedAddress}</AssociatedText>
        </>
      )}
      {associatedBnsName && currencyType !== 'BTC' && currencyType !== 'Ordinal' && (
      <>
        <SubText>{t('ASSOCIATED_BNS_DOMAIN')}</SubText>
        <AssociatedText>{associatedBnsName}</AssociatedText>
      </>
      )}
    </Container>
  );

  const handleOnPress = () => {
    onPressSend(associatedAddress !== '' ? associatedAddress : debouncedSearchTerm, switchToFiat ? getTokenEquivalent(amount) : amount, memo);
  };

  const onBuyClick = () => {
    navigate(`/buy/${currencyType}`);
  };

  const buyCryptoMessage = balance === 0 && (currencyType === 'STX' || currencyType === 'BTC') && (
    <BuyCryptoContainer>
      <img src={Info} alt="alert" />
      <ColumnContainer>
        <BuyCryptoText>{t('NO_FUNDS')}</BuyCryptoText>
        <BuyCryptoRedirectButton onClick={onBuyClick}>
          <BuyCryptoRedirectText>{t('BUY_CRYPTO')}</BuyCryptoRedirectText>
        </BuyCryptoRedirectButton>

      </ColumnContainer>
    </BuyCryptoContainer>
  );

  const checkIfEnableButton = () => {
    if (disableAmountInput) {
      if (recipientAddress !== '' || associatedAddress !== '') { return true; }
    } else if ((amount !== '' && recipientAddress !== '') || associatedAddress !== '') return true;
    return false;
  };
  return (
    <>
      <ScrollContainer>
        {currencyType !== 'NFT' && currencyType !== 'Ordinal' && (
        <TokenContainer>
          <TokenImage
            token={currencyType || undefined}
            loading={false}
            fungibleToken={fungibleToken || undefined}
          />
        </TokenContainer>
        )}
        <OuterContainer>
          {!disableAmountInput && renderEnterAmountSection}
          <ErrorContainer>
            <ErrorText>{amountError}</ErrorText>
          </ErrorContainer>
          {buyCryptoMessage}
          {children}
          {renderEnterRecipientSection}
          <ErrorContainer>
            <ErrorText>{addressError}</ErrorText>
          </ErrorContainer>
          {currencyType !== 'BTC' && currencyType !== 'NFT' && currencyType !== 'Ordinal' && !hideMemo && (
          <>
            <Container>
              <TitleText>{t('MEMO')}</TitleText>
              <MemoInputContainer error={memoError !== ''}>
                <InputFieldContainer>
                  <InputField
                    value={memo}
                    placeholder={t('MEMO_PLACEHOLDER')}
                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setMemo(e.target.value)}
                  />
                </InputFieldContainer>
              </MemoInputContainer>
            </Container>
            <MemoContainer>
              <ErrorText>{memoError}</ErrorText>
            </MemoContainer>
            <InfoContainer bodyText={t('MEMO_INFO')} />
          </>
          )}
          {
            currencyType === 'Ordinal' && (
              <OrdinalInfoContainer>
                <InfoContainer bodyText={t('SEND_ORDINAL_WALLET_WARNING')} type="Warning" />
              </OrdinalInfoContainer>
            )
          }
        </OuterContainer>

      </ScrollContainer>
      <SendButtonContainer enabled={checkIfEnableButton()}>
        <ActionButton
          text={buttonText ?? t('NEXT')}
          processing={processing}
          onPress={handleOnPress}
        />
      </SendButtonContainer>

    </>
  );
}

export default SendForm;
