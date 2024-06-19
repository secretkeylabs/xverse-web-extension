import InfoContainer from '@components/infoContainer';
import TokenImage from '@components/tokenImage';
import { useBnsName, useBnsResolver } from '@hooks/queries/useBnsName';
import useCoinRates from '@hooks/queries/useCoinRates';
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
import { FiatRow } from './fiatRow';
import useClearFormOnAccountSwitch from './useClearFormOnAccountSwitch';

import useSelectedAccount from '@hooks/useSelectedAccount';
import Button from '@ui-library/button';
import {
  AmountInputContainer,
  AssociatedText,
  BalanceText,
  Container,
  CurrencyFlag,
  ErrorText,
  InputField,
  InputFieldContainer,
  MemoContainer,
  MemoInputContainer,
  OrdinalInfoContainer,
  OuterContainer,
  RowContainer,
  ScrollContainer,
  SendButtonContainer,
  StyledInputFeedback,
  SubText,
  Text,
  TitleText,
  TokenContainer,
} from './index.styled';

interface Props {
  onPressSend: (recipientID: string, amount: string, memo?: string) => void;
  currencyType: CurrencyTypes;
  amountError?: string;
  recipientError?: string;
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
  recipientError,
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
  const [addressError, setAddressError] = useState<string | undefined>(recipientError);
  const navigate = useNavigate();

  const selectedAccount = useSelectedAccount();
  const { fiatCurrency } = useWalletSelector();
  const { btcFiatRate, stxBtcRate } = useCoinRates();
  const debouncedSearchTerm = useDebounce(recipientAddress, 300);
  const associatedBnsName = useBnsName(recipientAddress);
  const associatedAddress = useBnsResolver(
    debouncedSearchTerm,
    selectedAccount.stxAddress,
    currencyType,
  );
  const { isAccountSwitched } = useClearFormOnAccountSwitch();

  useEffect(() => {
    if (isAccountSwitched) {
      setAmount('');
      setRecipientAddress('');
    }
  }, [selectedAccount, isAccountSwitched]);

  useEffect(() => {
    if (recipientError) {
      if (associatedAddress !== '' && recipientError.includes(t('ERRORS.ADDRESS_INVALID'))) {
        setAddressError('');
      } else {
        setAddressError(recipientError);
      }
    }
  }, [recipientError, associatedAddress]);

  useEffect(() => {
    const resultRegex = /^\d*\.?\d*$/;

    if (!amountToSend || !resultRegex.test(amountToSend)) {
      return;
    }

    setFiatAmount(
      getFiatEquivalent(
        Number(amountToSend),
        currencyType,
        BigNumber(stxBtcRate),
        BigNumber(btcFiatRate),
        fungibleToken,
      ),
    );
  }, [amountToSend]);

  const getTokenCurrency = (): string => {
    if (fungibleToken) {
      if (fungibleToken?.ticker) {
        return fungibleToken.ticker.toUpperCase();
      }
      if (fungibleToken?.name) {
        return getTicker(fungibleToken.name).toUpperCase();
      }
    }
    return currencyType;
  };

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
    setFiatAmount(
      getFiatEquivalent(
        Number(amountToSend),
        currencyType,
        BigNumber(stxBtcRate),
        BigNumber(btcFiatRate),
        fungibleToken,
      ),
    );
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
          renderText={(value: string) => <Text data-testid="balance-label">{value}</Text>}
        />
      </RowContainer>
      <AmountInputContainer error={amountError !== ''}>
        <InputFieldContainer>
          <InputField
            data-testid="send-input"
            value={amount}
            placeholder="0"
            onChange={onInputChange}
          />
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
            data-testid="recipient-adress"
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

  const handleOnClickSend = () => {
    onPressSend(
      associatedAddress !== '' ? associatedAddress : debouncedSearchTerm || recipientAddress,
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
                currency={currencyType || undefined}
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
                        data-testid="memo-input"
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
        <Button
          title={buttonText ?? t('NEXT')}
          loading={processing}
          disabled={!checkIfEnableButton()}
          onClick={handleOnClickSend}
        />
      </SendButtonContainer>
    </>
  );
}

export default SendForm;
