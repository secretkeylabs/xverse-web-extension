import ArrowSwap from '@assets/img/icons/ArrowSwap.svg';
import RequestsRoutes from '@common/utils/route-urls';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useRuneFloorPriceQuery from '@hooks/queries/runes/useRuneFloorPriceQuery';
import useGetQuotes from '@hooks/queries/swaps/useGetQuotes';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useCoinRates from '@hooks/queries/useCoinRates';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import type { DataStxSignTransaction } from '@screens/transactionRequest/useStxTransactionRequest';
import {
  AnalyticsEvents,
  btcToSats,
  getBtcFiatEquivalent,
  getStxFiatEquivalent,
  microstacksToStx,
  stxToMicrostacks,
  type FungibleToken,
  type GetUtxosRequest,
  type MarketUtxo,
  type Quote,
  type Token,
  type UtxoQuote,
} from '@secretkeylabs/xverse-core';
import Button, { LinkButton } from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import SnackBar from '@ui-library/snackBar';
import { formatNumber, satsToBtcString } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
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
import trackSwapMixPanel from './mixpanel';
import QuoteSummary from './quoteSummary';
import QuotesModal from './quotesModal';
import type { OrderInfo, StxOrderInfo } from './types';
import useMasterCoinsList from './useMasterCoinsList';
import {
  mapFTNativeSwapTokenToTokenBasic,
  mapFTProtocolToSwapProtocol,
  mapFtToSwapToken,
  mapSwapProtocolToFTProtocol,
  mapSwapTokenToFT,
} from './utils';
import UtxoSelection from './utxoSelection';

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

const GetQuoteButtonContainer = styled.div((props) => ({
  marginTop: props.theme.space.l,
}));

const Icon = styled.img`
  width: 16px;
  height: 16px;
  rotate: 90deg;
`;

export default function SwapScreen() {
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<Quote>();
  const [selectedUtxoProvider, setSelectedUtxoProvider] = useState<UtxoQuote>();
  const [errorMessage, setErrorMessage] = useState('');

  const [getQuotesModalVisible, setGetQuotesModalVisible] = useState(false);
  const [tokenSelectionBottomSheet, setTokenSelectionBottomSheet] = useState<'from' | 'to' | null>(
    null,
  );
  const [fromToken, setFromToken] = useState<FungibleToken | undefined>();
  const [toToken, setToToken] = useState<Token | undefined>();
  const [utxosRequest, setUtxosRequest] = useState<GetUtxosRequest | null>(null);
  const [inputError, setInputError] = useState('');
  const [hasQuoteError, setHasQuoteError] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | undefined>();
  const [stxOrderInfo, setStxOrderInfo] = useState<StxOrderInfo | undefined>();

  const [selectedUtxos, setSelectedUtxos] = useState<Omit<MarketUtxo, 'token'>[]>();
  const [utxoProviderSendAmount, setUtxoProviderSendAmount] = useState<string | undefined>();

  const { fiatCurrency } = useWalletSelector();
  const { stxPublicKey } = useSelectedAccount();

  const { data: btcBalance } = useBtcWalletData();
  const { data: stxData } = useStxWalletData();

  const { btcFiatRate, btcUsdRate, stxBtcRate } = useCoinRates();
  const navigate = useNavigate();
  const { t } = useTranslation('translation');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultFrom = params.get('from');
  const { quotes, loading: quotesLoading, error: quotesError, fetchQuotes } = useGetQuotes();
  const { data: runeFloorPrice } = useRuneFloorPriceQuery(toToken?.name ?? '');
  const coinsMasterList = useMasterCoinsList();

  useEffect(() => {
    if (defaultFrom) {
      const token = coinsMasterList.find((coin) => coin.principal === defaultFrom);
      setFromToken(token);
    }
  }, [defaultFrom, coinsMasterList.length]);

  const handleGoBack = () => {
    navigate('/');
  };

  useEffect(() => {
    if (quotesLoading || !quotes) {
      return;
    }

    if (
      (quotes.amm.length === 0 && quotes.utxo.length === 0 && quotes.stx.length === 0) ||
      quotesError
    ) {
      return setHasQuoteError(true);
    }

    setGetQuotesModalVisible(true);
  }, [quotes, quotesLoading, quotesError]);

  const amountForQuote =
    fromToken?.principal === 'BTC' ? btcToSats(new BigNumber(amount)).toString() : amount;

  const getQuotes = async () => {
    if (!fromToken || !toToken) {
      return;
    }

    trackSwapMixPanel(AnalyticsEvents.FetchSwapQuote, {
      fromToken,
      toToken,
      amount: fromToken?.principal === 'BTC' ? btcToSats(new BigNumber(amount)).toString() : amount,
      quote,
      btcUsdRate,
      runeFloorPrice,
    });

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
        return coinsMasterList.find((coin) => coin.principal === ticker);
      case 'stacks':
        return coinsMasterList.find((coin) => coin.principal === ticker);
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
      getUserFTFromTokenTicker(toToken.protocol, toToken.ticker) ?? mapSwapTokenToFT(toToken);
    const newTo = mapFtToSwapToken(fromToken);
    setFromToken(newFrom);
    setToToken(newTo);
  };

  const onChangeToToken = (token: Token) => {
    setHasQuoteError(false);
    setToToken(token);
  };

  const onChangeFromToken = (token: FungibleToken) => {
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

    if (fromToken.principal === 'BTC') {
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

    if (fromToken.principal === 'BTC') {
      return satsToBtcString(BigNumber(btcBalance ?? 0));
    }

    if (fromToken.principal === 'STX') {
      return formatNumber(microstacksToStx(BigNumber(stxData?.availableBalance ?? 0)).toString());
    }

    if (fromToken.protocol === 'runes' || fromToken.protocol === 'stacks') {
      return getFtBalance(fromToken);
    }
  };

  // extends this for other protocols and stx when needed
  const getFromAmountFiatValue = () => {
    const balance = new BigNumber(amount || '0');

    if (fromToken?.principal === 'BTC') {
      const amountInSats = btcToSats(new BigNumber(balance));
      return getBtcFiatEquivalent(amountInSats, new BigNumber(btcFiatRate)).toFixed(2);
    }

    if (fromToken?.principal === 'STX') {
      const amountInMicroStx = stxToMicrostacks(new BigNumber(balance));
      return getStxFiatEquivalent(
        amountInMicroStx,
        new BigNumber(stxBtcRate),
        new BigNumber(btcFiatRate),
      ).toFixed(2);
    }

    if (!fromToken?.tokenFiatRate || !fromToken.decimals) {
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
    if (fromToken.principal === 'BTC' || fromToken.principal === 'STX') {
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
    !fromToken ||
    fromToken.principal === 'BTC' ||
    fromToken.principal === 'STX' ||
    BigNumber(amount).eq(getFtBalance(fromToken));
  const isRunesToBtcRoute =
    fromToken?.principal !== 'BTC' &&
    fromToken?.protocol === 'runes' &&
    toToken?.protocol === 'btc';

  useEffect(() => {
    if (errorMessage) {
      const toastId = toast.custom(
        <SnackBar text={errorMessage} type="error" dismissToast={() => toast.remove(toastId)} />,
        { duration: 3000 },
      );
      // Reset
      setErrorMessage('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMessage]);

  const setProvider = (isAmm: boolean, provider: Quote | UtxoQuote) => {
    if (!fromToken || !toToken) {
      return;
    }

    trackMixPanel(AnalyticsEvents.SelectSwapQuote, {
      provider: provider.provider.name,
      from: fromToken.principal === 'BTC' ? 'BTC' : fromToken.name,
      to: toToken.protocol === 'btc' ? 'BTC' : toToken.name ?? toToken.ticker,
    });

    if (isAmm) {
      setUtxosRequest(null);
      setSelectedUtxos(undefined);
      setUtxoProviderSendAmount(undefined);
      setQuote(provider as Quote);
    } else {
      setQuote(undefined);
      setSelectedUtxoProvider(provider as UtxoQuote);
      const request: GetUtxosRequest = {
        providerCode: provider.provider.code,
        from: provider.from,
        to: provider.to,
        amount:
          fromToken.principal === 'BTC' ? btcToSats(new BigNumber(amount)).toString() : amount,
      };
      setUtxosRequest(request);
    }
    setGetQuotesModalVisible(false);
  };

  const onConfirmExecute = () => {
    const provider = quote?.provider ?? selectedUtxoProvider?.provider;
    if (!fromToken || !toToken || !provider) {
      return;
    }
    trackSwapMixPanel(AnalyticsEvents.SignSwap, {
      provider,
      fromToken,
      toToken,
      amount,
      quote,
      btcUsdRate,
      runeFloorPrice,
    });
  };

  const QuoteModal = (
    <QuotesModal
      visible={getQuotesModalVisible}
      onClose={() => {
        setGetQuotesModalVisible(false);
      }}
      ammProviders={quotes?.amm || []}
      utxoProviders={quotes?.utxo || []}
      stxProviders={quotes?.stx || []}
      toToken={toToken}
      ammProviderClicked={(provider: Quote) => {
        setProvider(true, provider);
      }}
      utxoProviderClicked={(provider: UtxoQuote) => {
        setProvider(false, provider);
      }}
    />
  );

  if (orderInfo?.order.psbt) {
    return (
      <PsbtConfimation
        orderInfo={orderInfo}
        onConfirm={onConfirmExecute}
        onClose={() => setOrderInfo(undefined)}
      />
    );
  }

  const unsignedTransactionHexString = stxOrderInfo?.order.unsignedTransaction;

  if (unsignedTransactionHexString) {
    const dataStxSignTransactionOverride: DataStxSignTransaction = {
      context: {
        origin: 'extension',
        tabId: 0,
      },
      data: {
        method: 'stx_signTransaction',
        params: {
          transaction: unsignedTransactionHexString,
          pubkey: stxPublicKey,
          broadcast: true,
        },
        id: 'velar',
        jsonrpc: '2.0',
      },
    };

    navigate(RequestsRoutes.TransactionRequest, {
      state: {
        dataStxSignTransactionOverride,
      },
    });
  }

  if (quote) {
    return (
      <>
        <QuoteSummary
          amount={utxoProviderSendAmount ?? amountForQuote}
          quote={quote}
          fromToken={fromToken}
          toToken={toToken}
          onClose={() => setQuote(undefined)}
          onChangeProvider={() => {
            setGetQuotesModalVisible(true);
          }}
          onOrderPlaced={setOrderInfo}
          onStxOrderPlaced={setStxOrderInfo}
          onError={setErrorMessage}
          selectedIdentifiers={selectedUtxos}
        />
        {QuoteModal}
      </>
    );
  }

  if (utxosRequest) {
    return (
      <>
        <UtxoSelection
          utxosRequest={utxosRequest}
          onClose={() => setUtxosRequest(null)}
          toToken={toToken}
          selectedUtxoProvider={selectedUtxoProvider}
          onChangeProvider={() => {
            setGetQuotesModalVisible(true);
          }}
          onNext={(
            receiveAmount: string,
            sendBtcAmount: string,
            selectedIdentifiers: Omit<MarketUtxo, 'token'>[],
          ) => {
            if (!fromToken || !toToken || !selectedUtxoProvider) {
              return;
            }
            setUtxoProviderSendAmount(sendBtcAmount);
            setSelectedUtxos(selectedIdentifiers);
            const q: Quote = {
              from: mapFTNativeSwapTokenToTokenBasic(fromToken),
              to: mapFTNativeSwapTokenToTokenBasic(toToken),
              provider: selectedUtxoProvider.provider,
              receiveAmount,
              slippageSupported: false,
              slippageDecimals: 0,
              slippageThreshold: 0,
              feePercentage: selectedUtxoProvider.feePercentage,
              feeFlat: selectedUtxoProvider.feeFlat,
            };
            setQuote(q);
          }}
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
            <SwapButtonContainer
              data-testid="swap-token-button"
              onClick={onClickSwapRoute}
              disabled={isSwapRouteDisabled}
            >
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
                fromToken?.principal === 'BTC'
                  ? 'btc'
                  : fromToken?.protocol
                  ? mapFTProtocolToSwapProtocol(fromToken)
                  : undefined,
              decimals: fromToken?.principal === 'BTC' ? 8 : fromToken?.decimals,
              unit: fromToken?.principal === 'BTC' ? 'BTC' : fromToken?.runeSymbol ?? '',
            }}
            max={
              fromToken?.principal === 'BTC' || fromToken?.principal === 'STX'
                ? undefined
                : { isDisabled: isMaxDisabled, onClick: onClickMax }
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
          <GetQuoteButtonContainer>
            <Button
              disabled={isGetQuotesDisabled}
              variant={errorMsg ? 'danger' : 'primary'}
              title={errorMsg || t('SWAP_SCREEN.GET_QUOTES')}
              loading={quotesLoading}
              onClick={getQuotes}
            />
          </GetQuoteButtonContainer>
        )}
        {QuoteModal}
        <TokenFromBottomSheet
          onClose={() => setTokenSelectionBottomSheet(null)}
          onSelectCoin={onChangeFromToken}
          visible={tokenSelectionBottomSheet === 'from'}
          title={t('SWAP_SCREEN.SWAP_FROM')}
          to={toToken}
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
