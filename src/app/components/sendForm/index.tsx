import ActionButton from '@components/button';
import InfoContainer from '@components/infoContainer';
import TokenImage from '@components/tokenImage';
import { useBnsName, useBnsResolver } from '@hooks/queries/useBnsName';
import useDebounce from '@hooks/useDebounce';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  FungibleToken,
  getBtcEquivalent,
  getFiatEquivalent,
  getStxTokenEquivalent,
} from '@secretkeylabs/xverse-core';
import InputFeedback from '@ui-library/inputFeedback';
import { CurrencyTypes } from '@utils/constants';
import { getCurrencyFlag } from '@utils/currency';
import { getTicker } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { ReactNode, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiatRow } from './fiatRow';
import useClearFormOnAccountSwitch from './useClearFormOnAccountSwitch';

interface ContainerProps {
  error: boolean;
}
const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
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

const MemoContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(3),
  marginBottom: props.theme.spacing(6),
}));

const ErrorText = styled.p((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.danger_medium,
}));

const InputFieldContainer = styled.div(() => ({
  flex: 1,
}));

const TitleText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  flex: 1,
  display: 'flex',
}));

const Text = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
}));

const SubText = styled.p((props) => ({
  ...props.theme.typography.body_s,
  display: 'flex',
  flex: 1,
  color: props.theme.colors.white_400,
}));

const AssociatedText = styled.p((props) => ({
  ...props.theme.typography.body_s,
  wordWrap: 'break-word',
}));

const BalanceText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  marginRight: props.theme.spacing(2),
}));

const InputField = styled.input((props) => ({
  ...props.theme.typography.body_m,
  backgroundColor: props.theme.colors.elevation_n1,
  color: props.theme.colors.white_0,
  width: '100%',
  border: 'transparent',
}));

const AmountInputContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  border: props.error
    ? '1px solid rgba(211, 60, 60, 0.3)'
    : `1px solid ${props.theme.colors.elevation3}`,
  backgroundColor: props.theme.colors.elevation_n1,
  borderRadius: props.theme.radius(1),
  paddingLeft: props.theme.spacing(5),
  paddingRight: props.theme.spacing(5),
  height: 44,
  ':focus-within': {
    border: `1px solid ${props.theme.colors.elevation6}`,
  },
}));

const MemoInputContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  border: props.error
    ? '1px solid rgba(211, 60, 60, 0.3)'
    : `1px solid ${props.theme.colors.elevation3}`,
  backgroundColor: props.theme.colors.elevation_n1,
  borderRadius: props.theme.radius(1),
  padding: props.theme.spacing(7),
  height: 76,
  ':focus-within': {
    border: `1px solid ${props.theme.colors.elevation6}`,
  },
}));

const SendButtonContainer = styled.div((props) => ({
  paddingBottom: props.theme.spacing(12),
  paddingTop: props.theme.spacing(4),
  marginLeft: '5%',
  marginRight: '5%',
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

const StyledInputFeedback = styled(InputFeedback)((props) => ({
  marginBottom: props.theme.spacing(4),
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
  hideTokenImage?: boolean;
  hideDefaultWarning?: boolean;
  buttonText?: string;
  processing?: boolean;
  children?: ReactNode;
  recipient?: string;
  amountToSend?: string;
  stxMemo?: string;
  onAddressInputChange?: (recipientAddress: string) => void;
  warning?: string;
  info?: string;
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
  hideTokenImage = false,
  hideDefaultWarning = false,
  buttonText,
  processing,
  children,
  recipient,
  amountToSend,
  stxMemo,
  onAddressInputChange,
  warning,
  info,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  // TODO tim: use context instead of duplicated local state and parent state (as props)
  const [amount, setAmount] = useState(amountToSend ?? '');
  const [recipientAddress, setRecipientAddress] = useState(recipient ?? '');
  const [memo, setMemo] = useState(stxMemo ?? '');
  const [fiatAmount, setFiatAmount] = useState<string | undefined>('0');
  const [switchToFiat, setSwitchToFiat] = useState(false);
  const [addressError, setAddressError] = useState<string | undefined>(recepientError);
  const navigate = useNavigate();

  const { stxBtcRate, btcFiatRate, fiatCurrency, stxAddress, selectedAccount } =
    useWalletSelector();
  const debouncedSearchTerm = useDebounce(recipientAddress, 300);
  const associatedBnsName = useBnsName(recipientAddress);
  const associatedAddress = useBnsResolver(debouncedSearchTerm, stxAddress, currencyType);
  const { isAccountSwitched } = useClearFormOnAccountSwitch();

  useEffect(() => {
    if (isAccountSwitched) {
      setAmount('');
      setRecipientAddress('');
    }
  }, [selectedAccount, isAccountSwitched]);

  useEffect(() => {
    if (recepientError) {
      if (associatedAddress !== '' && recepientError.includes(t('ERRORS.ADDRESS_INVALID'))) {
        setAddressError('');
      } else {
        setAddressError(recepientError);
      }
    }
  }, [recepientError, associatedAddress]);

  useEffect(() => {
    const resultRegex = /^\d*\.?\d*$/;

    if (!amountToSend || !resultRegex.test(amountToSend)) {
      return;
    }

    const amountInCurrency = getFiatEquivalent(
      Number(amountToSend),
      currencyType,
      BigNumber(stxBtcRate),
      BigNumber(btcFiatRate),
      fungibleToken,
    );
    setFiatAmount(amountInCurrency);
  }, [amountToSend]);

  function getTokenCurrency(): string {
    if (fungibleToken) {
      if (fungibleToken?.ticker) {
        return fungibleToken.ticker.toUpperCase();
      }
      if (fungibleToken?.name) {
        return getTicker(fungibleToken.name).toUpperCase();
      }
    }
    return currencyType;
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

    const amountInCurrency = getFiatEquivalent(
      Number(newValue),
      currencyType,
      BigNumber(stxBtcRate),
      BigNumber(btcFiatRate),
      fungibleToken,
    );
    setFiatAmount(amountInCurrency);
  };

  const getTokenEquivalent = (tokenAmount: string): string => {
    if ((currencyType === 'FT' && !fungibleToken?.tokenFiatRate) || currencyType === 'NFT') {
      return '';
    }
    if (!tokenAmount) return '0';
    switch (currencyType) {
      case 'STX':
        return getStxTokenEquivalent(
          new BigNumber(tokenAmount),
          BigNumber(stxBtcRate),
          BigNumber(btcFiatRate),
        )
          .toFixed(6)
          .toString();
      case 'BTC':
        return getBtcEquivalent(new BigNumber(tokenAmount), BigNumber(btcFiatRate))
          .toFixed(8)
          .toString();
      case 'FT':
        if (fungibleToken?.tokenFiatRate) {
          return new BigNumber(tokenAmount)
            .dividedBy(fungibleToken.tokenFiatRate)
            .toFixed(fungibleToken.decimals ?? 2)
            .toString();
        }
        return '';
      default:
        return '';
    }
  };

  const getAmountLabel = () => {
    if (switchToFiat) return fiatCurrency;
    return getTokenCurrency();
  };

  const renderEnterAmountSection = (
    <Container>
      <RowContainer>
        <TitleText>{t('AMOUNT')}</TitleText>
        <BalanceText>{t('BALANCE')}:</BalanceText>
        <NumericFormat
          value={balance}
          displayType="text"
          thousandSeparator
          renderText={(value: string) => <Text>{value}</Text>}
        />
      </RowContainer>
      <AmountInputContainer error={amountError !== ''}>
        <InputFieldContainer>
          <InputField value={amount} placeholder="0" onChange={onInputChange} />
        </InputFieldContainer>
        <Text>{getAmountLabel()}</Text>
        {switchToFiat && <CurrencyFlag src={getCurrencyFlag(fiatCurrency)} />}
      </AmountInputContainer>
      <FiatRow
        onClick={onSwitchPress}
        showFiat={switchToFiat}
        tokenCurrency={getTokenCurrency()}
        tokenAmount={getTokenEquivalent(amount)}
        fiatCurrency={fiatCurrency}
        fiatAmount={fiatAmount ?? ''}
      />
    </Container>
  );

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value);
    onAddressInputChange?.(e.target.value);
  };

  const getAddressInputPlaceholder = () => {
    if (currencyType === 'BTC') {
      return t('BTC_RECIPIENT_PLACEHOLDER');
    }
    if (currencyType === 'Ordinal' || currencyType === 'brc20-Ordinal') {
      return t('ORDINAL_RECIPIENT_PLACEHOLDER');
    }
    return t('RECIPIENT_PLACEHOLDER');
  };

  const renderEnterRecipientSection = (
    <Container>
      <TitleText>{t('RECIPIENT')}</TitleText>
      <AmountInputContainer error={addressError !== ''}>
        <InputFieldContainer>
          <InputField
            value={recipientAddress}
            placeholder={getAddressInputPlaceholder()}
            onChange={handleAddressInputChange}
          />
        </InputFieldContainer>
      </AmountInputContainer>
      {associatedAddress &&
        currencyType !== 'BTC' &&
        currencyType !== 'Ordinal' &&
        currencyType !== 'brc20-Ordinal' && (
          <>
            <SubText>{t('ASSOCIATED_ADDRESS')}</SubText>
            <AssociatedText>{associatedAddress}</AssociatedText>
          </>
        )}
      {associatedBnsName &&
        currencyType !== 'BTC' &&
        currencyType !== 'Ordinal' &&
        currencyType !== 'brc20-Ordinal' && (
          <>
            <SubText>{t('ASSOCIATED_BNS_DOMAIN')}</SubText>
            <AssociatedText>{associatedBnsName}</AssociatedText>
          </>
        )}
    </Container>
  );

  const handleOnPress = () => {
    onPressSend(
      associatedAddress !== '' ? associatedAddress : debouncedSearchTerm,
      switchToFiat ? getTokenEquivalent(amount) : amount,
      memo,
    );
  };

  const onBuyClick = () => {
    navigate(`/buy/${currencyType}`);
  };

  const buyCryptoMessage = balance === 0 && (currencyType === 'STX' || currencyType === 'BTC') && (
    <InfoContainer bodyText={t('NO_FUNDS')} redirectText={t('BUY_CRYPTO')} onClick={onBuyClick} />
  );

  const checkIfEnableButton = () => {
    if (disableAmountInput) {
      if (recipientAddress !== '' || associatedAddress !== '') {
        return true;
      }
    } else if ((amount !== '' && recipientAddress !== '') || associatedAddress !== '') return true;
    return false;
  };

  let displayedWarning = '';
  if (warning) {
    displayedWarning = warning;
  } else if (!hideDefaultWarning) {
    switch (currencyType) {
      case 'Ordinal':
        displayedWarning = t('MAKE_SURE_THE_RECIPIENT');
        break;
      case 'brc20-Ordinal':
        displayedWarning = t('SEND_BRC20_ORDINAL_WALLET_WARNING');
        break;
      default:
        break;
    }
  }

  return (
    <>
      <ScrollContainer>
        {currencyType !== 'NFT' &&
          currencyType !== 'Ordinal' &&
          currencyType !== 'brc20-Ordinal' &&
          !hideTokenImage && (
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
          {amountError && <StyledInputFeedback message={amountError} variant="danger" />}
          {buyCryptoMessage}
          {children}
          {renderEnterRecipientSection}
          {addressError && <StyledInputFeedback message={addressError} variant="danger" />}
          {info && <InputFeedback message={info} />}
          {currencyType !== 'BTC' &&
            currencyType !== 'NFT' &&
            currencyType !== 'Ordinal' &&
            currencyType !== 'brc20-Ordinal' &&
            !hideMemo && (
              <>
                <Container>
                  <TitleText>{t('MEMO')}</TitleText>
                  <MemoInputContainer error={memoError !== ''}>
                    <InputFieldContainer>
                      <InputField
                        value={memo}
                        placeholder={t('MEMO_PLACEHOLDER')}
                        onChange={(e: { target: { value: SetStateAction<string> } }) =>
                          setMemo(e.target.value)
                        }
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
          {displayedWarning && (
            <OrdinalInfoContainer>
              <InfoContainer bodyText={displayedWarning} type="Warning" />
            </OrdinalInfoContainer>
          )}
        </OuterContainer>
      </ScrollContainer>
      <SendButtonContainer>
        <ActionButton
          text={buttonText ?? t('NEXT')}
          processing={processing}
          disabled={!checkIfEnableButton()}
          onPress={handleOnPress}
        />
      </SendButtonContainer>
    </>
  );
}

export default SendForm;
