import ArrowSwap from '@assets/img/icons/ArrowSwap.svg';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useGetQuotes from '@hooks/queries/swaps/useGetQuotes';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useCoinRates from '@hooks/queries/useCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  btcToSats,
  getBtcFiatEquivalent,
  type ExecuteOrderRequest,
  type FungibleToken,
  type PlaceOrderResponse,
  type Quote,
  type Token,
  type UtxoQuote,
} from '@secretkeylabs/xverse-core';
import Button, { LinkButton } from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import SnackBar from '@ui-library/snackBar';
import { satsToBtcString } from '@utils/helper';
import { getFtBalance } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AmountInput from './components/amountInput';
import PsbtConfimation from './components/psbtConfirmation/psbtConfirmation';
import RouteItem from './components/routeItem';
import TokenFromBottomSheet from './components/tokenFromBottomSheet';
import TokenToBottomSheet from './components/tokenToBottomSheet';
import QuoteSummary from './quoteSummary';
import QuotesModal from './quotesModal';
import {
  mapFTNativeSwapTokenToTokenBasic,
  mapFTProtocolToSwapProtocol,
  mapSwapProtocolToFTProtocol,
  mapSwapTokenToFT,
} from './utils';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: `0 ${props.theme.space.m} ${props.theme.space.l} ${props.theme.space.m}`,
}));

const Flex1 = styled.div<{ center?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: ${(props) => (props.center ? 'center' : 'flex-start')};
  align-items: ${(props) => (props.center ? 'center' : 'normal')};
`;

const RouteContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: `${props.theme.space.l} 0`,
}));

const SwapButtonContainer = styled.button<{ disabled: boolean }>((props) => ({
  display: 'flex',
  background: props.theme.colors.white_0,
  padding: props.theme.space.xs,
  alignSelf: 'flex-end',
  borderRadius: props.theme.space.xxl,
  marginBottom: props.theme.space.xs,
  opacity: props.disabled ? 0.5 : 1,
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  ':hover': {
    opacity: props.disabled ? 0.5 : 0.8,
  },
}));

const SendButtonContainer = styled.div((props) => ({
  marginTop: props.theme.space.l,
}));

const Icon = styled.img`
  width: 16px;
  height: 16px;
  rotate: 90deg;
`;

const mapFtToSwapToken = (ft: FungibleToken | 'BTC'): Token => ({
  ticker: ft === 'BTC' ? 'BTC' : ft.principal ?? '',
  name: ft === 'BTC' ? 'Bitcoin' : ft.name ?? ft.assetName ?? '',
  protocol: ft === 'BTC' ? 'btc' : mapFTProtocolToSwapProtocol(ft.protocol ?? 'runes'),
  divisibility: ft === 'BTC' ? 8 : ft?.decimals ?? 0,
  logo: ft === 'BTC' ? undefined : ft.image ?? ft.runeInscriptionId ?? '',
  symbol: ft === 'BTC' ? undefined : ft.runeSymbol ?? '',
});

export default function SwapScreen() {
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<Quote>();
  const [errorMessage, setErrorMessage] = useState('');

  const [getQuotesModalVisible, setGetQuotesModalVisible] = useState(false);
  const [tokenSelectionBottomSheet, setTokenSelectionBottomSheet] = useState<'from' | 'to' | null>(
    null,
  );
  const [fromToken, setFromToken] = useState<FungibleToken | 'BTC' | undefined>();
  const [toToken, setToToken] = useState<Token | undefined>();
  const [inputError, setInputError] = useState('');
  const [hasQuoteError, setHasQuoteError] = useState(false);
  const [orderInfo, setOrderInfo] = useState<
    { order: PlaceOrderResponse; providerCode: ExecuteOrderRequest['providerCode'] } | undefined
  >();

  const { fiatCurrency } = useWalletSelector();

  const { unfilteredData } = useRuneFungibleTokensQuery();
  const { data: btcBalance } = useBtcWalletData();
  const { btcFiatRate } = useCoinRates();
  const navigate = useNavigate();
  const { t } = useTranslation('translation');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultFrom = params.get('from');
  const { quotes, loading: quotesLoading, error: quotesError, fetchQuotes } = useGetQuotes();

  const runesCoinsList = unfilteredData ?? [];

  useEffect(() => {
    if (defaultFrom) {
      const token =
        defaultFrom === 'BTC'
          ? 'BTC'
          : runesCoinsList.find((coin) => coin.principal === defaultFrom);
      setFromToken(token);
    }
  }, [defaultFrom, runesCoinsList.length]);

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (quotesLoading || !quotes) {
      return;
    }

    if ((quotes.amm.length === 0 && quotes.utxo.length === 0) || quotesError) {
      return setHasQuoteError(true);
    }

    setGetQuotesModalVisible(true);
  }, [quotes, quotesLoading, quotesError]);

  const amountForQuote = fromToken === 'BTC' ? btcToSats(new BigNumber(amount)).toString() : amount;

  const getQuotes = async () => {
    if (!fromToken || !toToken) {
      return;
    }

    fetchQuotes({
      from: mapFTNativeSwapTokenToTokenBasic(fromToken),
      to: mapFTNativeSwapTokenToTokenBasic(toToken),
      amount: amountForQuote,
    });
  };

  const onClickFrom = () => setTokenSelectionBottomSheet('from');
  const onClickTo = () => setTokenSelectionBottomSheet('to');

  const getUserFTFromTokenTicker = (
    protocol: Token['protocol'],
    ticker: Token['ticker'],
  ): FungibleToken | undefined => {
    const ftProtocol = mapSwapProtocolToFTProtocol(protocol);

    // add more protocols here when needed
    switch (ftProtocol) {
      case 'runes':
        return runesCoinsList.find((coin) => coin.principal === ticker);
      default:
        return undefined;
    }
  };

  const isSwapRouteDisabled = !fromToken || !toToken;

  const onClickSwapRoute = () => {
    if (isSwapRouteDisabled) {
      return;
    }

    setInputError('');
    setAmount('');
    setHasQuoteError(false);
    const newFrom =
      toToken.protocol === 'btc'
        ? 'BTC'
        : getUserFTFromTokenTicker(toToken.protocol, toToken.ticker) ?? mapSwapTokenToFT(toToken);
    const newTo = mapFtToSwapToken(fromToken);
    setFromToken(newFrom);
    setToToken(newTo);
  };

  const onChangeToToken = (token: Token) => {
    setHasQuoteError(false);
    setToToken(token);
  };

  const onChangeFromToken = (token: FungibleToken | 'BTC') => {
    setInputError('');
    setAmount('');
    setHasQuoteError(false);
    setFromToken(token);
    if (fromToken) {
      setToToken(undefined);
    }
  };

  const onChangeAmount = (value: string) => {
    if (!fromToken) {
      return;
    }

    if (fromToken === 'BTC') {
      const amountInSats = btcToSats(new BigNumber(value));
      setInputError(
        BigNumber(amountInSats).gt(BigNumber(btcBalance ?? 0))
          ? t('SEND.ERRORS.INSUFFICIENT_BALANCE')
          : '',
      );
      return setAmount(value);
    }

    setInputError(
      BigNumber(value).gt(getFtBalance(fromToken)) ? t('SEND.ERRORS.INSUFFICIENT_BALANCE') : '',
    );
    setAmount(value);
  };

  // extends this for other protocols and stx when needed
  const getFromBalance = () => {
    if (!fromToken) {
      return undefined;
    }

    if (fromToken === 'BTC') {
      return satsToBtcString(BigNumber(btcBalance ?? 0));
    }

    if (fromToken.protocol === 'runes') {
      return getFtBalance(fromToken);
    }
  };

  // extends this for other protocols and stx when needed
  const getFromAmountFiatValue = () => {
    const balance = new BigNumber(amount || '0');

    if (fromToken === 'BTC') {
      const amountInSats = btcToSats(new BigNumber(balance));
      return getBtcFiatEquivalent(amountInSats, new BigNumber(btcFiatRate)).toFixed(2);
    }

    if (fromToken?.protocol !== 'runes' || !fromToken?.tokenFiatRate || !fromToken.decimals) {
      return '0.00';
    }

    const rate = new BigNumber(fromToken.tokenFiatRate);
    return balance.multipliedBy(rate).toFixed(2);
  };

  const onClickMax = () => {
    if (!fromToken) {
      return;
    }

    // we can't use max for btc
    if (fromToken === 'BTC') {
      return;
    }

    setInputError('');
    setAmount(getFtBalance(fromToken));
  };

  const emptyBalanceError =
    Number(getFromBalance()) === 0 ? t('SEND.ERRORS.INSUFFICIENT_BALANCE') : '';
  const errorMsg = inputError || emptyBalanceError;

  const isAmountInValid = BigNumber(amount).isNaN() || BigNumber(amount).lte(0);
  const ifFormInValid = !fromToken || !toToken || isAmountInValid || Boolean(errorMsg);
  const isGetQuotesDisabled = ifFormInValid || quotesLoading || Boolean(quotesError);

  const isMaxDisabled =
    !fromToken || fromToken === 'BTC' || BigNumber(amount).eq(getFtBalance(fromToken));
  const isRunesToBtcRoute =
    fromToken !== 'BTC' && fromToken?.protocol === 'runes' && toToken?.protocol === 'btc';

  useEffect(() => {
    if (errorMessage) {
      const toastId = toast.custom(
        <SnackBar
          text={errorMessage}
          type="error"
          actionButtonCallback={() => {
            toast.remove(toastId);
          }}
        />,
        { duration: 3000 },
      );
      // Reset
      setErrorMessage('');
    }
  }, [errorMessage]);

  const QuoteModal = (
    <QuotesModal
      visible={getQuotesModalVisible}
      onClose={() => {
        setGetQuotesModalVisible(false);
      }}
      ammProviders={quotes?.amm || []}
      utxoProviders={quotes?.utxo || []}
      toToken={toToken}
      ammProviderClicked={(provider: Quote) => {
        setQuote(provider);
        setGetQuotesModalVisible(false);
      }}
      utxoProviderClicked={(provider: UtxoQuote) => {
        // todo: navigate to utxo selection screen
        setQuote(undefined);
        setGetQuotesModalVisible(false);
        console.log('utxo clicked', provider);
      }}
    />
  );

  if (orderInfo?.order.psbt) {
    return <PsbtConfimation orderInfo={orderInfo} onClose={() => setOrderInfo(undefined)} />;
  }

  if (quote) {
    return (
      <>
        <QuoteSummary
          amount={amountForQuote}
          quote={quote}
          fromToken={fromToken}
          toToken={toToken}
          onClose={() => setQuote(undefined)}
          onChangeProvider={() => {
            setGetQuotesModalVisible(true);
          }}
          onOrderPlaced={setOrderInfo}
          onError={setErrorMessage}
        />
        {QuoteModal}
      </>
    );
  }

  return (
    <>
      <TopRow onClick={handleGoBack} />
      <Container>
        <StyledP typography="headline_s" color="white_0">
          {t('SWAP_SCREEN.SWAP')}
        </StyledP>
        <Flex1>
          <RouteContainer>
            <RouteItem token={fromToken} label={t('SWAP_SCREEN.FROM')} onClick={onClickFrom} />
            <SwapButtonContainer onClick={onClickSwapRoute} disabled={isSwapRouteDisabled}>
              <Icon src={ArrowSwap} />
            </SwapButtonContainer>
            <RouteItem token={toToken} label={t('SWAP_SCREEN.TO')} onClick={onClickTo} />
          </RouteContainer>
          <AmountInput
            input={{
              value: amount,
              onChange: onChangeAmount,
              fiatValue: getFromAmountFiatValue(),
              fiatCurrency,
              protocol:
                fromToken === 'BTC'
                  ? 'btc'
                  : fromToken?.protocol
                  ? mapFTProtocolToSwapProtocol(fromToken.protocol)
                  : undefined,
              decimals: fromToken === 'BTC' ? 8 : fromToken?.decimals,
              unit: fromToken === 'BTC' ? 'BTC' : fromToken?.runeSymbol ?? '',
            }}
            max={
              fromToken === 'BTC' ? undefined : { isDisabled: isMaxDisabled, onClick: onClickMax }
            }
            balance={getFromBalance()}
          />
          {hasQuoteError && (
            <Flex1 center>
              <StyledP typography="body_m" color="white_200">
                {t('SWAP_SCREEN.ERRORS.NO_PAIR_LIQUIDITY')}
              </StyledP>
              {isRunesToBtcRoute ? (
                <LinkButton
                  title={t('SWAP_SCREEN.LIST_YOUR_RUNES')}
                  variant="tertiary"
                  onClick={() => navigate(`/list-rune/${fromToken?.principal}?from=swap`)}
                />
              ) : (
                <StyledP typography="body_m" color="white_200">
                  {t('SWAP_SCREEN.ERRORS.TRY_ANOTHER_PAIR')}
                </StyledP>
              )}
            </Flex1>
          )}
        </Flex1>
        {!hasQuoteError && (
          <SendButtonContainer>
            <Button
              disabled={isGetQuotesDisabled}
              variant={errorMsg ? 'danger' : 'primary'}
              title={errorMsg || t('SWAP_SCREEN.GET_QUOTES')}
              loading={quotesLoading}
              onClick={getQuotes}
            />
          </SendButtonContainer>
        )}
        {QuoteModal}
        <TokenFromBottomSheet
          onClose={() => setTokenSelectionBottomSheet(null)}
          onSelectCoin={onChangeFromToken}
          visible={tokenSelectionBottomSheet === 'from'}
          title={t('SWAP_SCREEN.SWAP_FROM')}
          to={toToken && fromToken ? undefined : toToken}
        />
        <TokenToBottomSheet
          onClose={() => setTokenSelectionBottomSheet(null)}
          onSelectCoin={onChangeToToken}
          resetFrom={() => setFromToken(undefined)}
          visible={tokenSelectionBottomSheet === 'to'}
          title={t('SWAP_SCREEN.SWAP_TO')}
          from={fromToken}
        />
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}
