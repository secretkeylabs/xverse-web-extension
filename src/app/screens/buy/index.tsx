import BottomBar from '@components/tabBar';
import TokenImage from '@components/tokenImage';
import TopRow from '@components/topRow';
import useGetSupportedCurrencies from '@hooks/queries/onramp/useGetSupportedCurrencies';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import ActionCard from '@ui-library/actionCard';
import Button from '@ui-library/button';
import Spinner from '@ui-library/spinner';
import { useEffect, useState, type FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  ActionCardContent,
  ActionCardText,
  ActionCardValue,
  Chip,
  CryptoSheetSelectItem,
  CryptoSheetSelectItemValues,
  PaymentMethodChips,
  SelectedContainer,
  SheetSelect,
  SheetSelectItem,
} from './index.styled';
import PayWithCrypto from './payWithCrypto';
import SelectCurrency from './selectCurrency';

import SelectIcon from '@assets/img/SelectionIcon.svg';
import type { BuyQuoteError, PaymentMethod } from '@hooks/queries/onramp/client/types';
import useGetBuyQuotes from '@hooks/queries/onramp/useGetBuyQuotes';
import useGetDefaults from '@hooks/queries/onramp/useGetDefaults';
import useGetPaymentMethods from '@hooks/queries/onramp/useGetPaymentMethods';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { CheckCircle, Selection } from '@phosphor-icons/react';
import { AnalyticsEvents } from '@secretkeylabs/xverse-core';
import { formatNumber } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import Theme from 'theme';
import BuyQuotes from './buyQuotes';
import { SheetErrorContainer, SheetErrorContent, TryAgainButton } from './buyQuotes/index.styled';
import PaymentMethodImage from './paymentMethodImage';
import {
  allQuotesAreErrors,
  convertFiatToCrypto,
  getPresetValuesByCurrencyCode,
  getQuotesErrorMessage,
  handleKeyDownNumberInput,
  isFiatCurrencyConversionSupported,
  SUPPORTED_CRYPTO_CURRENCIES,
} from './utils';

const BuyQuotesForm = styled.form`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-left: 22px;
  padding-right: 22px;
  padding-top: ${({ theme }) => theme.space.xs};
  &::-webkit-scrollbar {
    display: none;
  }
  margin-bottom: 22px;
`;

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
}));

const LoaderContainer = styled.div({
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed',
  zIndex: 10,
  background: 'rgba(25, 25, 48, 0.5)',
  backdropFilter: 'blur(2px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const TitleContainer = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const BuyAmountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  flex: '1 0 0',
  alignSelf: 'stretch',
  gap: props.theme.space.xs,
  paddingBottom: props.theme.space.xs,
}));

const BuyAmountContainerValues = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: props.theme.space.xs,
  alignItems: 'flex-start',
  flex: '1 0 0',
}));

const BuyAmountValueInputContainer = styled.div({
  display: 'flex',
});

const BuyAmountValueCurrency = styled.span((props) => ({
  ...props.theme.typography.headline_xl,
  color: props.theme.colors.white_0,
}));

const BuyAmountValueInput = styled.input<{ $isInvalid?: boolean }>((props) => ({
  ...props.theme.typography.headline_xl,
  border: 'none',
  color: props.theme.colors.white_0,
  backgroundColor: 'transparent',
  caretColor: props.theme.colors.tangerine,
  width: '100%',
  ...(props.$isInvalid && { color: props.theme.colors.danger_light }),
  '&::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&::placeholder': {
    color: 'props.theme.colors.white_600',
  },
}));

const BuyAmountConversion = styled.div((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
}));

const BuyAmountChips = styled.div((props) => ({
  display: 'flex',
  gap: props.theme.space.xs,
}));

const BuyAmountChip = styled(Button)((props) => ({
  width: 'auto',
  borderRadius: props.theme.radius(11),
  padding: `${props.theme.space.xs} ${props.theme.space.s}`,
  ...props.theme.typography.body_m,
}));

const BuyAmountErrorMessage = styled.div<{ $visible?: boolean }>((props) => ({
  ...props.theme.typography.body_medium_s,
  color: props.theme.colors.danger_light,
  visibility: props.$visible ? 'initial' : 'hidden',
  display: 'flex',
  alignItems: 'center',
  gap: props.theme.space.xxs,
}));

const ActionCardContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.xs,
  marginBottom: props.theme.space.m,
}));

function Buy() {
  const { t } = useTranslation('translation', { keyPrefix: 'BUY_SCREEN' });
  const navigate = useNavigate();
  const { currency } = useParams();
  const { hasBackedUpWallet } = useWalletSelector();
  const { btcAddress, stxAddress } = useSelectedAccount();

  const [buyAmount, setBuyAmount] = useState('');
  const [presetBuyAmount, setPresetBuyAmount] = useState<string | undefined>(undefined);
  const [buyingFiatCurrency, setBuyingFiatCurrency] = useState<string>('');
  const [cryptoToBuy, setCryptoToBuy] = useState(
    SUPPORTED_CRYPTO_CURRENCIES.find((crypto) => crypto.symbol === currency) ??
      SUPPORTED_CRYPTO_CURRENCIES[0],
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>();

  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [selectCryptoModalVisible, setSelectCryptoModalVisible] = useState(false);
  const [selectPaymentMethodVisible, setSelectPaymentMethodVisible] = useState(false);
  const [selectQuoteModalVisible, setSelectQuoteModalVisible] = useState(false);
  const [cachedMinLimit, setCachedMinLimit] = useState<number | null>(null);
  const [cachedMaxLimit, setCachedMaxLimit] = useState<number | null>(null);

  const isSelectedFiatCurrencyConversionSupported =
    isFiatCurrencyConversionSupported(buyingFiatCurrency);

  const { stxBtcRate, btcFiatRate } = useSupportedCoinRates(
    isSelectedFiatCurrencyConversionSupported ? buyingFiatCurrency : undefined,
  );
  const supportedCurrencies = useGetSupportedCurrencies();
  const paymentMethods = useGetPaymentMethods({
    source: buyingFiatCurrency,
    target: cryptoToBuy.onramperId,
  });
  const defaults = useGetDefaults();

  const onramperUserId = cryptoToBuy.symbol === 'BTC' ? btcAddress : stxAddress;

  const getBuyQuotes = useGetBuyQuotes(
    {
      fiat: buyingFiatCurrency,
      crypto: cryptoToBuy.onramperId,
      amount: Number(buyAmount),
      paymentMethod: paymentMethod?.paymentTypeId || '',
      uuid: onramperUserId,
    },
    { enabled: false },
  );

  const fiatToCryptoRate = convertFiatToCrypto(
    buyAmount,
    btcFiatRate,
    stxBtcRate,
    cryptoToBuy.symbol,
  );
  const selectedCurrencySymbol = supportedCurrencies.data?.message.fiat.find(
    (fiat) => fiat.code === buyingFiatCurrency,
  )?.symbol;

  useEffect(() => {
    if (defaults.data && paymentMethods.data) {
      const paymentMethodList = paymentMethods.data.message;
      const recommendedId = defaults.data.message.recommended.paymentMethod;

      const recommended = paymentMethodList.find((item) => item.paymentTypeId === recommendedId);
      const creditCard = paymentMethodList.find((item) => item.paymentTypeId === 'creditcard');

      const paymentMethodToUse = recommended || creditCard || paymentMethodList[0];

      setPaymentMethod(paymentMethodToUse);
    }
  }, [defaults.data, paymentMethods.data]);

  useEffect(() => {
    if (defaults.data && supportedCurrencies.data) {
      const defaultFiatCurrency = defaults.data.message.recommended.source;
      const isDefaultFiatCurrencySupported = supportedCurrencies.data.message.fiat.find(
        (fiat) => fiat.code === defaultFiatCurrency,
      );

      setBuyingFiatCurrency(isDefaultFiatCurrencySupported ? defaultFiatCurrency : 'USD');
    }
  }, [defaults.data, supportedCurrencies.data]);

  const validateBuyAmount = (amount: string) => {
    if (
      !paymentMethod ||
      !paymentMethod.details.limits.aggregatedLimit?.min ||
      !paymentMethod.details.limits.aggregatedLimit?.max
    ) {
      return null;
    }

    const trimmedAmount = amount.trim();
    const numericAmount = Number(trimmedAmount);

    if (trimmedAmount === '' || numericAmount === 0) {
      return t('ERRORS.AMOUNT_REQUIRED');
    }

    if (Number.isNaN(numericAmount)) {
      return t('ERRORS.AMOUNT_INVALID');
    }

    if (cachedMinLimit !== null && numericAmount < cachedMinLimit) {
      return t('ERRORS.MINIMUM_AMOUNT', {
        minAmount: `${selectedCurrencySymbol}${formatNumber(cachedMinLimit)}`,
      });
    }

    if (cachedMaxLimit !== null && numericAmount > cachedMaxLimit) {
      return t('ERRORS.MAXIMUM_AMOUNT', {
        maxAmount: `${selectedCurrencySymbol}${formatNumber(cachedMaxLimit)}`,
      });
    }

    return null;
  };

  useEffect(() => {
    // Revalidate buy amount when payment method or crypto to buy changes
    if (hasSubmitted) {
      setError(validateBuyAmount(buyAmount));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod]);

  const handleBackButtonClick = () => {
    navigate('/');
  };

  const handleBuyAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBuyAmount(event.target.value);
    setPresetBuyAmount(undefined);

    setError(validateBuyAmount(event.target.value));

    const num = Number(event.target.value);
    if (!Number.isNaN(num)) {
      trackMixPanel(AnalyticsEvents.InputFiatAmount, {
        amount: num,
        currency: buyingFiatCurrency,
      });
    }
  };

  const handlePresetAmountClick = (amount: string) => {
    setBuyAmount(amount);
    setPresetBuyAmount(amount);

    if (hasSubmitted) {
      setError(validateBuyAmount(amount));
    }

    trackMixPanel(AnalyticsEvents.ClickQuickAmountButton, { amount: Number(amount) });
  };

  const handleChangeCryptoToBuy = (crypto: typeof cryptoToBuy) => {
    setCryptoToBuy(crypto);
    setSelectCryptoModalVisible(false);

    trackMixPanel(AnalyticsEvents.SelectCryptoToBuy, { crypto: crypto.symbol });
  };

  const handleFiatCurrencyChange = (value: string) => {
    setBuyingFiatCurrency(value);
    trackMixPanel(AnalyticsEvents.CurrencySelected, { currency: value });
  };

  const handleChangePaymentMethod = (paymentMethodItem: PaymentMethod) => {
    setPaymentMethod(paymentMethodItem);
    setSelectPaymentMethodVisible(false);

    trackMixPanel(AnalyticsEvents.PaymentMethodSelected, { method: paymentMethodItem.name });
  };

  const isLoading = supportedCurrencies.isLoading || paymentMethods.isLoading || defaults.isLoading;

  const canShowBuyQuotesSheet = Boolean(
    !error &&
      buyingFiatCurrency &&
      cryptoToBuy.onramperId &&
      Number(buyAmount) &&
      paymentMethod?.paymentTypeId,
  );

  const presetValues = getPresetValuesByCurrencyCode(buyingFiatCurrency);

  const handleSubmitGetBuyQuotes: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!hasSubmitted) {
      setHasSubmitted(true);
    }

    const validationErrors = validateBuyAmount(buyAmount);
    setError(validationErrors);
    if (validationErrors) {
      return;
    }

    setError(null);

    const buyQuotes = await getBuyQuotes.refetch();
    if (buyQuotes.error) {
      setError(t('ERRORS.FETCHING_QUOTES'));
      return;
    }

    if (allQuotesAreErrors(buyQuotes.data!)) {
      setError(
        getQuotesErrorMessage(buyQuotes.data as BuyQuoteError[], t, buyingFiatCurrency, {
          onLimitErrorFound: (limitErr) => {
            setCachedMinLimit(limitErr.minAmount);
            setCachedMaxLimit(limitErr.maxAmount);
          },
        }),
      );
      return;
    }

    setSelectQuoteModalVisible(canShowBuyQuotesSheet);
  };

  return (
    <>
      <TopRow backupReminder={!hasBackedUpWallet} onClick={handleBackButtonClick} />
      <BuyQuotesForm onSubmit={handleSubmitGetBuyQuotes}>
        {isLoading && (
          <LoaderContainer>
            <Spinner color="white" size={20} />
          </LoaderContainer>
        )}
        <TitleContainer>
          <Title>{t('BUY')}</Title>
          <SelectCurrency value={buyingFiatCurrency} onChange={handleFiatCurrencyChange} />
        </TitleContainer>
        <BuyAmountContainer>
          <BuyAmountContainerValues>
            <div>
              <BuyAmountValueInputContainer>
                <BuyAmountValueCurrency>{selectedCurrencySymbol}</BuyAmountValueCurrency>
                <BuyAmountValueInput
                  autoFocus
                  type="number"
                  step="any"
                  min={0}
                  value={buyAmount}
                  onChange={handleBuyAmountChange}
                  onKeyDown={handleKeyDownNumberInput}
                  $isInvalid={error !== null}
                  placeholder="0"
                />
              </BuyAmountValueInputContainer>
              {isSelectedFiatCurrencyConversionSupported && fiatToCryptoRate !== undefined && (
                <BuyAmountConversion>
                  {fiatToCryptoRate} {cryptoToBuy.symbol}
                </BuyAmountConversion>
              )}
            </div>
            {presetValues && (
              <BuyAmountChips>
                {presetValues.map((amount) => {
                  const isSelected = presetBuyAmount === amount;

                  return (
                    <BuyAmountChip
                      key={amount}
                      type="button"
                      variant={isSelected ? 'primary' : 'secondary'}
                      title={`${selectedCurrencySymbol}${amount}`}
                      onClick={() => handlePresetAmountClick(amount)}
                    />
                  );
                })}
              </BuyAmountChips>
            )}
          </BuyAmountContainerValues>
          <BuyAmountErrorMessage $visible={Boolean(error)}>
            {error ?? <>&nbsp;</>}
          </BuyAmountErrorMessage>
        </BuyAmountContainer>
        <ActionCardContainer>
          <ActionCard
            withArrow
            type="button"
            label={
              <ActionCardContent>
                <ActionCardText>{t('SELECT_CRYPTO_LABEL')}</ActionCardText>
                <ActionCardValue>
                  <TokenImage currency={cryptoToBuy?.symbol} size={24} />
                  <span>{cryptoToBuy?.name}</span>
                </ActionCardValue>
              </ActionCardContent>
            }
            onClick={() => setSelectCryptoModalVisible(true)}
          />
          <SheetSelect
            title={t('AVAILABLE_TOKENS')}
            visible={selectCryptoModalVisible}
            onClose={() => setSelectCryptoModalVisible(false)}
          >
            <ul>
              {SUPPORTED_CRYPTO_CURRENCIES.map((crypto) => {
                const isSelected = crypto.symbol === cryptoToBuy?.symbol;

                return (
                  <SheetSelectItem
                    key={crypto.symbol}
                    onClick={() => handleChangeCryptoToBuy(crypto)}
                  >
                    <CryptoSheetSelectItem>
                      <TokenImage currency={crypto.symbol} />
                      <CryptoSheetSelectItemValues>
                        <span>{crypto.name}</span>
                        <span>{crypto.symbol}</span>
                      </CryptoSheetSelectItemValues>
                    </CryptoSheetSelectItem>
                    {isSelected && <CheckCircle color="white" weight="fill" size={20} />}
                  </SheetSelectItem>
                );
              })}
            </ul>
          </SheetSelect>
          <ActionCard
            withArrow
            type="button"
            label={
              <ActionCardContent>
                <ActionCardText>{t('SELECT_PAYMENT_METHOD_LABEL')}</ActionCardText>
                <ActionCardValue>
                  <PaymentMethodImage
                    size={24}
                    backgroundTransparent={!paymentMethod?.icon}
                    src={paymentMethod?.icon ?? SelectIcon}
                    alt={`${paymentMethod?.name ?? 'Empty'} icon`}
                  />
                  <span>{paymentMethod?.name ?? t('NO_PAYMENT_METHOD')}</span>
                </ActionCardValue>
              </ActionCardContent>
            }
            onClick={() => setSelectPaymentMethodVisible(true)}
          />
          <SheetSelect
            title={t('PAYMENT_METHOD')}
            visible={selectPaymentMethodVisible}
            onClose={() => setSelectPaymentMethodVisible(false)}
          >
            <ul>
              {paymentMethods.data?.message.length === 0 && (
                <SheetErrorContainer $verticalPaddingSmaller>
                  <Selection color={Theme.colors.white_400} size={40} />
                  <SheetErrorContent>
                    <div className="title">{t('ERRORS.NO_PAYMENT_METHODS_TITLE')}</div>
                    <div className="message">{t('ERRORS.NO_PAYMENT_METHODS_CONTENT')}</div>
                  </SheetErrorContent>
                  <TryAgainButton
                    title={t('TRY_AGAIN')}
                    onClick={() => setSelectPaymentMethodVisible(false)}
                  />
                </SheetErrorContainer>
              )}
              {paymentMethods.data?.message.map((paymentMethodItem) => {
                const isSelected = paymentMethod?.paymentTypeId === paymentMethodItem.paymentTypeId;
                const isRecommended =
                  defaults.data?.message.recommended.paymentMethod ===
                  paymentMethodItem.paymentTypeId;
                const isApplePay = paymentMethodItem.paymentTypeId === 'applepay';

                return (
                  <SheetSelectItem
                    key={paymentMethodItem.paymentTypeId}
                    onClick={() => handleChangePaymentMethod(paymentMethodItem)}
                  >
                    <CryptoSheetSelectItem>
                      <PaymentMethodImage
                        src={paymentMethodItem.icon}
                        alt={`${paymentMethodItem.name} icon`}
                      />
                      <CryptoSheetSelectItemValues $wrap={isRecommended || isApplePay}>
                        <span>{paymentMethodItem.name}</span>
                      </CryptoSheetSelectItemValues>
                    </CryptoSheetSelectItem>
                    <PaymentMethodChips>
                      {isRecommended ? (
                        <Chip $color="green">{t('RECOMMENDED_CHIP')}</Chip>
                      ) : (
                        isApplePay && <Chip $color="grey">{t('APPLE_PAY_CHIP')}</Chip>
                      )}
                      {isSelected && (
                        <SelectedContainer>
                          <CheckCircle color="white" weight="fill" size={20} />
                        </SelectedContainer>
                      )}
                    </PaymentMethodChips>
                  </SheetSelectItem>
                );
              })}
              <PayWithCrypto />
            </ul>
          </SheetSelect>
        </ActionCardContainer>
        <Button
          type="submit"
          variant="primary"
          icon={getBuyQuotes.isFetching ? <Spinner color="black" size={14} /> : undefined}
          title={getBuyQuotes.isFetching ? t('FETCHING_QUOTES') : t('GET_QUOTES')}
          disabled={!canShowBuyQuotesSheet || getBuyQuotes.isFetching}
        />
        {canShowBuyQuotesSheet && (
          <BuyQuotes
            visible={selectQuoteModalVisible}
            buyQuotes={getBuyQuotes}
            buyAmount={buyAmount}
            buyingFiatCurrency={buyingFiatCurrency}
            cryptoToBuy={cryptoToBuy}
            paymentMethod={paymentMethod!}
            onClose={() => setSelectQuoteModalVisible(false)}
          />
        )}
      </BuyQuotesForm>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default Buy;
