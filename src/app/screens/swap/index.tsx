import ArrowSwap from '@assets/img/icons/ArrowSwap.svg';
import RequestsRoutes from '@common/utils/route-urls';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useRuneFiatRateQuery from '@hooks/queries/runes/useRuneFiatRateQuery';
import useRuneFloorPriceQuery from '@hooks/queries/runes/useRuneFloorPriceQuery';
import useGetSip10TokenInfo from '@hooks/queries/stx/useGetSip10TokenInfo';
import useGetQuotes from '@hooks/queries/swaps/useGetQuotes';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
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
import PsbtConfirmation from './components/psbtConfirmation/psbtConfirmation';
import RouteItem from './components/routeItem';
import TokenFromBottomSheet from './components/tokenFromBottomSheet';
import useFromTokens from './components/tokenFromBottomSheet/useFromTokens';
import TokenToBottomSheet from './components/tokenToBottomSheet';
import { getSwapsMixpanelProperties } from './mixpanel';
import QuoteSummary from './quoteSummary';
import QuotesModal from './quotesModal';
import type { OrderInfo, Side, StxOrderInfo } from './types';
import useVisibleMasterCoinsList from './useVisibleMasterCoinsList';
import {
  getTrackingIdentifier,
  isStxTx,
  mapFTNativeSwapTokenToTokenBasic,
  mapFTProtocolToSwapProtocol,
  mapSwapTokenToFT,
} from './utils';
import UtxoSelection from './utxoSelection';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: `0 ${props.theme.space.m} ${props.theme.space.l} ${props.theme.space.m}`,
}));

const Flex1 = styled.div<{ $center?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: ${(props) => (props.$center ? 'center' : 'flex-start')};
  align-items: ${(props) => (props.$center ? 'center' : 'normal')};
`;

const RouteContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: props.theme.space.s,
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
  const [tokenSelectionBottomSheet, setTokenSelectionBottomSheet] = useState<Side | null>(null);
  const [fromToken, setFromToken] = useState<FungibleToken | undefined>();
  const [toToken, setToToken] = useState<FungibleToken | undefined>();
  const [utxosRequest, setUtxosRequest] = useState<GetUtxosRequest | null>(null);
  const [inputError, setInputError] = useState('');
  const [hasQuoteError, setHasQuoteError] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | undefined>();
  const [stxOrderInfo, setStxOrderInfo] = useState<StxOrderInfo | undefined>();
  const fromTokens = useFromTokens();

  const [selectedUtxos, setSelectedUtxos] = useState<Omit<MarketUtxo, 'token'>[]>();
  const [utxoProviderSendAmount, setUtxoProviderSendAmount] = useState<string | undefined>();

  const { fiatCurrency } = useWalletSelector();
  const { stxPublicKey, ordinalsAddress } = useSelectedAccount();

  const { data: btcBalance } = useBtcWalletData();
  const { data: stxData } = useStxWalletData();

  const { btcFiatRate, btcUsdRate, stxBtcRate } = useSupportedCoinRates();
  const navigate = useNavigate();
  const { t } = useTranslation('translation');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultFrom = params.get('from');
  const defaultTo = params.get('to');
  const { quotes, loading: quotesLoading, error: quotesError, fetchQuotes } = useGetQuotes();
  const coinsMasterList = useVisibleMasterCoinsList();
  const { tokenInfo: sip10FromTokenInfoUSD } = useGetSip10TokenInfo({
    principal: toToken?.principal,
    fiatCurrency: 'USD',
  });
  const { data: fromRuneFloorPrice } = useRuneFloorPriceQuery(fromToken?.name ?? '');

  const { data: toRuneFiatRate } = useRuneFiatRateQuery(
    toToken?.protocol === 'runes' ? toToken?.principal ?? '' : '',
  );

  useEffect(() => {
    if (defaultFrom && !fromToken) {
      const token = coinsMasterList.find((coin) => coin.principal === defaultFrom);
      setFromToken(token);
    }
    if (defaultTo && !toToken) {
      const token = coinsMasterList.find((coin) => coin.principal === defaultTo);
      setToToken(token);
    }
  }, [defaultFrom, defaultTo, coinsMasterList]);

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

    const trackingPayload = getSwapsMixpanelProperties({
      fromToken,
      toToken,
      amount: amountForQuote,
      quote,
      btcUsdRate: BigNumber(btcUsdRate),
      stxBtcRate: BigNumber(stxBtcRate),
      fromRuneFloorPrice: BigNumber(fromRuneFloorPrice ?? 0),
      fromStxTokenFiatValue: BigNumber(sip10FromTokenInfoUSD?.tokenFiatRate ?? 0),
    });

    trackMixPanel(AnalyticsEvents.FetchSwapQuote, trackingPayload);

    await fetchQuotes({
      from: mapFTNativeSwapTokenToTokenBasic(fromToken),
      to: mapFTNativeSwapTokenToTokenBasic(toToken),
      amount: amountForQuote,
      ordAddress: ordinalsAddress,
    });
  };

  const onClickFrom = () => setTokenSelectionBottomSheet('from');
  const onClickTo = () => setTokenSelectionBottomSheet('to');

  const isSwapRouteDisabled = !fromToken || !toToken;

  const onClickSwapRoute = () => {
    if (isSwapRouteDisabled) {
      return;
    }

    setInputError('');
    setAmount('');
    setHasQuoteError(false);

    const newFrom = toToken;
    const newTo = fromToken;

    setFromToken(newFrom);
    setToToken(newTo);

    if (newFrom?.principal !== 'BTC') {
      const matchingToken = fromTokens.find(
        (token) => token.principal !== 'BTC' && token.principal === newFrom?.principal,
      );

      if (matchingToken) {
        setFromToken(matchingToken);
      }
    }
  };

  const onChangeToToken = (token: Token) => {
    setHasQuoteError(false);
    setToToken(mapSwapTokenToFT(token));
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
      return '--';
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
    toToken?.principal === 'BTC';

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage, { duration: 3000 });
      // Reset
      setErrorMessage('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMessage]);

  const setProvider = (isAmm: boolean, provider: Quote | UtxoQuote) => {
    if (!fromToken || !toToken) {
      return;
    }

    const trackingPayload = {
      provider: provider.provider.name,
      from: getTrackingIdentifier(fromToken),
      to: getTrackingIdentifier(toToken),
      fromPrincipal: isStxTx({ fromToken, toToken }) ? fromToken.principal : undefined,
      toPrincipal: isStxTx({ fromToken, toToken }) ? toToken.ticker : undefined,
    };

    trackMixPanel(AnalyticsEvents.SelectSwapQuote, trackingPayload);

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

    const trackingPayload = getSwapsMixpanelProperties({
      provider,
      fromToken,
      toToken,
      amount: amountForQuote,
      quote,
      btcUsdRate: BigNumber(btcUsdRate),
      stxBtcRate: BigNumber(stxBtcRate),
      fromRuneFloorPrice: new BigNumber(fromRuneFloorPrice ?? 0),
      fromStxTokenFiatValue: new BigNumber(sip10FromTokenInfoUSD?.tokenFiatRate ?? 0),
    });

    trackMixPanel(AnalyticsEvents.SignSwap, trackingPayload);
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
      amount={amount}
      ammProviderClicked={(provider: Quote) => {
        setProvider(true, provider);
      }}
      utxoProviderClicked={(provider: UtxoQuote) => {
        setProvider(false, provider);
      }}
      toRuneFiatRate={toRuneFiatRate}
    />
  );

  if (orderInfo?.order.psbt) {
    return (
      <PsbtConfirmation
        orderInfo={orderInfo}
        onConfirm={onConfirmExecute}
        onClose={() => setOrderInfo(undefined)}
      />
    );
  }

  const unsignedTransactionHexString = stxOrderInfo?.order.unsignedTransaction;

  if (unsignedTransactionHexString && quote) {
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
        id: quote?.provider.code,
        jsonrpc: '2.0',
      },
    };

    navigate(RequestsRoutes.TransactionRequest, {
      state: {
        dataStxSignTransactionOverride,
        mixpanelMetadata: {
          provider: quote.provider,
          fromToken,
          toToken,
          amount: amountForQuote,
          quote,
          btcUsdRate: BigNumber(btcUsdRate),
          fromRuneFloorPrice: BigNumber(fromRuneFloorPrice ?? 0),
          fromStxTokenFiatValue: BigNumber(sip10FromTokenInfoUSD?.tokenFiatRate ?? 0),
          stxBtcRate: BigNumber(stxBtcRate),
        },
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
              unit: fromToken?.runeSymbol ?? fromToken?.ticker ?? fromToken?.principal,
            }}
            max={
              fromToken?.principal === 'BTC' || fromToken?.principal === 'STX'
                ? undefined
                : { isDisabled: isMaxDisabled, onClick: onClickMax }
            }
            balance={getFromBalance()}
          />
          {hasQuoteError && (
            <Flex1 $center>
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
