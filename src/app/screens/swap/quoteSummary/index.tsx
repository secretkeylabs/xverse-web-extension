import SlippageEditIcon from '@assets/img/swap/slippageEdit.svg';
import FormattedNumber from '@components/formattedNumber';
import TopRow from '@components/topRow';
import useXverseApi from '@hooks/apiClients/useXverseApi';
import useRuneFiatRateQuery from '@hooks/queries/runes/useRuneFiatRateQuery';
import useRuneFloorPriceQuery from '@hooks/queries/runes/useRuneFloorPriceQuery';
import useGetSip10TokenInfo from '@hooks/queries/stx/useGetSip10TokenInfo';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useSearchParamsState from '@hooks/useSearchParamsState';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowDown, ArrowRight, WarningOctagon } from '@phosphor-icons/react';
import {
  AnalyticsEvents,
  RUNE_DISPLAY_DEFAULTS,
  applyMultiplierAndCapFeeAtThreshold,
  formatBalance,
  getBtcFiatEquivalent,
  getStxFiatEquivalent,
  stxToMicrostacks,
  type FungibleToken,
  type MarketUtxo,
  type PlaceUtxoOrderRequest,
  type Quote,
} from '@secretkeylabs/xverse-core';
import { deserializeTransaction } from '@stacks/transactions';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import { formatNumber } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { getSwapsMixpanelProperties } from '../mixpanel';
import QuoteTile from '../quotesModal/quoteTile';
import SlippageModalContent from '../slippageModal';
import type { OrderInfo, StxOrderInfo } from '../types';
import {
  BAD_QUOTE_PERCENTAGE,
  getProviderDetails,
  isRunesTx,
  mapFTNativeSwapTokenToTokenBasic,
} from '../utils';
import EditFee from './EditFee';
import {
  ArrowInnerContainer,
  ArrowOuterContainer,
  CalloutContainer,
  Container,
  EditFeeRateContainer,
  FeeRate,
  Flex1,
  ListingDescContainer,
  ListingDescriptionRow,
  QuoteToBaseContainer,
  RouteContainer,
  SendButtonContainer,
  SlippageButton,
} from './index.styled';
import QuoteSummaryTile from './quoteSummaryTile';
import usePlaceOrder from './usePlaceOrder';
import usePlaceUtxoOrder from './usePlaceUtxoOrder';

type Props = {
  amount: string;
  fromToken?: FungibleToken;
  toToken?: FungibleToken;
  quote: Quote;
  onClose: () => void;
  onChangeProvider: () => void;
  onError: (errorMessage: string) => void;
  onOrderPlaced: ({ order, providerCode }: OrderInfo) => void;
  onStxOrderPlaced: ({ order, providerCode }: StxOrderInfo) => void;
  selectedIdentifiers?: Omit<MarketUtxo, 'token'>[];
};

export default function QuoteSummary({
  amount,
  fromToken,
  toToken,
  quote,
  onClose,
  onChangeProvider,
  onOrderPlaced,
  onStxOrderPlaced,
  onError,
  selectedIdentifiers,
}: Props) {
  const { t } = useTranslation('translation');

  const { tokenInfo: sip10ToTokenInfo } = useGetSip10TokenInfo({
    principal: toToken?.principal,
  });

  const { tokenInfo: sip10FromTokenInfoUSD } = useGetSip10TokenInfo({
    principal: fromToken?.principal,
    fiatCurrency: 'USD',
  });
  const xverseApiClient = useXverseApi();

  const theme = useTheme();
  const { btcFiatRate, btcUsdRate, stxBtcRate } = useSupportedCoinRates();
  const { btcAddress, ordinalsAddress, btcPublicKey, ordinalsPublicKey, stxAddress, stxPublicKey } =
    useSelectedAccount();
  const {
    loading: isPlaceOrderLoading,
    error: placeOrderError,
    placeOrder,
    placeStxOrder,
  } = usePlaceOrder();
  const {
    loading: isPlaceUtxoOrderLoading,
    error: placeUtxoOrderError,
    placeUtxoOrder,
  } = usePlaceUtxoOrder();

  useEffect(() => {
    if (placeOrderError || placeUtxoOrderError) {
      onError(placeOrderError ?? placeUtxoOrderError ?? '');
    }
  }, [placeOrderError, placeUtxoOrderError]);

  const { data: recommendedFees } = useBtcFeeRate();
  const [feeRate, setFeeRate] = useSearchParamsState('feeRate', '0');
  const { data: runeFloorPrice } = useRuneFloorPriceQuery(toToken?.name ?? '');
  const { data: toRuneFiatRate } = useRuneFiatRateQuery(
    toToken?.protocol === 'runes' ? toToken?.principal ?? '' : '',
  );

  useEffect(() => {
    if (recommendedFees && feeRate === '0') {
      setFeeRate(recommendedFees.regular.toString());
    }
  }, [recommendedFees, feeRate]);

  const { fiatCurrency } = useWalletSelector();

  const fromUnit = (() => {
    if (fromToken?.principal === 'BTC') {
      return 'Sats';
    }
    if (fromToken?.principal === 'STX') {
      return 'STX';
    }
    if (fromToken?.protocol === 'runes') {
      return fromToken?.runeSymbol ?? RUNE_DISPLAY_DEFAULTS.symbol;
    }

    return fromToken?.ticker;
  })();

  const toUnit = (() => {
    if (toToken?.principal === 'BTC') {
      return 'Sats';
    }
    if (toToken?.runeSymbol) {
      return toToken.runeSymbol;
    }
    if (toToken?.protocol === 'runes') {
      return RUNE_DISPLAY_DEFAULTS.symbol;
    }
    if (toToken?.principal === 'STX') {
      return 'STX';
    }
    return toToken?.name;
  })();

  const isRunesSwap = fromToken?.protocol === 'runes' || toToken?.protocol === 'runes';
  const isSip10Swap = fromToken?.protocol === 'stacks' || toToken?.protocol === 'stacks';

  const [showSlippageModal, setShowSlippageModal] = useState(false);
  const DEFAULT_SLIPPAGE = quote.slippageThreshold ?? 0.05;
  const [slippage, setSlippage] = useSearchParamsState('slippage', DEFAULT_SLIPPAGE);

  const handleSwap = async () => {
    if (!fromToken || !toToken) {
      return;
    }

    const trackingPayload = getSwapsMixpanelProperties({
      provider: quote.provider,
      fromToken,
      toToken,
      amount,
      quote,
      btcUsdRate: BigNumber(btcUsdRate),
      stxBtcRate: BigNumber(stxBtcRate),
      fromRuneFloorPrice: new BigNumber(runeFloorPrice ?? 0),
      fromStxTokenFiatValue: new BigNumber(sip10FromTokenInfoUSD?.tokenFiatRate ?? 0),
    });

    trackMixPanel(AnalyticsEvents.ConfirmSwap, trackingPayload);

    if (selectedIdentifiers) {
      const placeUtxoOrderRequest: PlaceUtxoOrderRequest = {
        providerCode: quote.provider.code,
        from: mapFTNativeSwapTokenToTokenBasic(fromToken),
        to: mapFTNativeSwapTokenToTokenBasic(toToken),
        orders: selectedIdentifiers,
        feeRate: Number(feeRate),
        btcAddress,
        btcPubKey: btcPublicKey,
        ordAddress: ordinalsAddress,
        ordPubKey: ordinalsPublicKey,
      };
      const placeUtxoOrderResponse = await placeUtxoOrder(placeUtxoOrderRequest);
      if (placeUtxoOrderResponse?.psbt && placeUtxoOrderResponse.orders.length > 0) {
        return onOrderPlaced({ order: placeUtxoOrderResponse, providerCode: quote.provider.code });
      }

      // if no orders are returned it means that all the utxos were swept
      if (placeUtxoOrderResponse?.orders.length === 0) {
        onError(t('SWAP_SCREEN.ERRORS.NO_UTXOS_FOR_PURCHASE'));
      }
    } else if (isRunesSwap) {
      const placeOrderRequest = {
        providerCode: quote.provider.code,
        from: mapFTNativeSwapTokenToTokenBasic(fromToken),
        to: mapFTNativeSwapTokenToTokenBasic(toToken),
        sendAmount: amount,
        receiveAmount: quote.receiveAmount,
        slippage,
        feeRate: Number(feeRate),
        btcAddress,
        btcPubKey: btcPublicKey,
        ordAddress: ordinalsAddress,
        ordPubKey: ordinalsPublicKey,
        identifier: quote.identifier,
      };
      const placeOrderResponse = await placeOrder(placeOrderRequest);

      if (placeOrderResponse?.psbt) {
        onOrderPlaced({ order: placeOrderResponse, providerCode: quote.provider.code });
      }
    } else if (isSip10Swap) {
      const placeStxOrderRequest = {
        providerCode: quote.provider.code,
        from: mapFTNativeSwapTokenToTokenBasic(fromToken),
        to: mapFTNativeSwapTokenToTokenBasic(toToken),
        sendAmount: amount,
        receiveAmount: quote.receiveAmount,
        slippage,
        feeRate: Number(feeRate),
        stxAddress,
        stxPublicKey,
      };
      const placeOrderResponse = await placeStxOrder(placeStxOrderRequest);

      if (placeOrderResponse?.unsignedTransaction) {
        const swapTx = deserializeTransaction(placeOrderResponse.unsignedTransaction);
        await applyMultiplierAndCapFeeAtThreshold(swapTx, xverseApiClient);
        placeOrderResponse.unsignedTransaction = swapTx.serialize();
        onStxOrderPlaced({ order: placeOrderResponse, providerCode: quote.provider.code });
      }
    }
  };

  const feeUnits = toToken?.protocol === 'stacks' || toToken?.principal === 'STX' ? 'STX' : 'Sats';

  const showSlippageWarning = Boolean(
    quote.slippageSupported && quote.slippageThreshold && slippage > quote.slippageThreshold,
  );

  const fromTokenFiatValue = (() => {
    if (fromToken?.principal === 'BTC') {
      return getBtcFiatEquivalent(new BigNumber(amount), new BigNumber(btcFiatRate)).toFixed(2);
    }
    if (fromToken?.principal === 'STX') {
      return getStxFiatEquivalent(
        stxToMicrostacks(new BigNumber(amount)),
        new BigNumber(stxBtcRate),
        new BigNumber(btcFiatRate),
      ).toFixed(2);
    }
    return fromToken?.tokenFiatRate
      ? new BigNumber(fromToken?.tokenFiatRate).multipliedBy(amount).toFixed(2)
      : '--';
  })();

  const toTokenFiatValue = (() => {
    if (toToken?.principal === 'BTC') {
      return getBtcFiatEquivalent(
        new BigNumber(quote.receiveAmount),
        new BigNumber(btcFiatRate),
      ).toFixed(2);
    }
    if (toToken?.protocol === 'runes' && toRuneFiatRate) {
      return new BigNumber(toRuneFiatRate).multipliedBy(quote.receiveAmount).toFixed(2);
    }
    if (toToken?.principal === 'STX') {
      return getStxFiatEquivalent(
        stxToMicrostacks(new BigNumber(quote.receiveAmount)),
        new BigNumber(stxBtcRate),
        new BigNumber(btcFiatRate),
      ).toFixed(2);
    }
    if (!sip10ToTokenInfo?.tokenFiatRate) {
      return '--';
    }
    return new BigNumber(sip10ToTokenInfo?.tokenFiatRate)
      .multipliedBy(quote.receiveAmount)
      .toFixed(2);
  })();

  const showBadQuoteWarning = new BigNumber(toTokenFiatValue).isLessThan(
    new BigNumber(fromTokenFiatValue).multipliedBy(BAD_QUOTE_PERCENTAGE),
  );
  const valueLossPercentage = new BigNumber(fromTokenFiatValue)
    .minus(new BigNumber(toTokenFiatValue))
    .dividedBy(new BigNumber(fromTokenFiatValue))
    .multipliedBy(100)
    .toFixed(0);

  const getTokenRate = (): string => {
    if (toToken?.principal === 'BTC') {
      return new BigNumber(quote.receiveAmount)
        .dividedBy(new BigNumber(amount))
        .decimalPlaces(2)
        .toString();
    }
    const satsPerRune = new BigNumber(amount).dividedBy(new BigNumber(quote.receiveAmount));
    return new BigNumber(1).dividedBy(satsPerRune).toString();
  };

  const { name: providerName, logo: providerLogo } = getProviderDetails(quote);

  return (
    <>
      <TopRow onClick={onClose} />

      <Container>
        {showBadQuoteWarning && (
          <CalloutContainer>
            <Callout
              titleText={t('SWAP_SCREEN.BAD_QUOTE_WARNING_TITLE')}
              bodyText={
                BigNumber(toTokenFiatValue).isGreaterThan(0)
                  ? t('SWAP_SCREEN.BAD_QUOTE_WARNING_DESC', {
                      percentage: valueLossPercentage,
                    })
                  : t('SWAP_SCREEN.UNKNOWN_QUOTE_VALUE_WARNING_DESC')
              }
              variant="warning"
            />
          </CalloutContainer>
        )}
        <StyledP typography="headline_s" color="white_0">
          {t('SWAP_SCREEN.QUOTE')}
        </StyledP>
        <Flex1>
          <QuoteSummaryTile
            fromUnit={fromUnit}
            toUnit={toUnit}
            rate={getTokenRate()}
            provider={providerName}
            image={providerLogo}
            onClick={onChangeProvider}
          />
          <QuoteToBaseContainer>
            <QuoteTile
              provider="Amount"
              price={amount}
              token={fromToken}
              subtitle={fromToken?.name}
              subtitleColorOverride="white_400"
              unit={fromUnit}
              fiatValue={fromTokenFiatValue}
            />
            <ArrowOuterContainer>
              <ArrowInnerContainer>
                <ArrowDown size={16} />
              </ArrowInnerContainer>
            </ArrowOuterContainer>
            <QuoteTile
              provider="Amount"
              price={quote.receiveAmount}
              token={toToken}
              subtitle={toToken?.name}
              subtitleColorOverride="white_400"
              unit={toUnit}
              fiatValue={toTokenFiatValue}
            />
          </QuoteToBaseContainer>

          <ListingDescContainer>
            {quote.slippageSupported && (
              <ListingDescriptionRow>
                <StyledP typography="body_medium_m" color="white_200">
                  {t('SWAP_SCREEN.SLIPPAGE')}
                </StyledP>
                <SlippageButton
                  data-testid="slippage-button"
                  onClick={() => setShowSlippageModal(true)}
                  $showWarning={showSlippageWarning}
                >
                  {showSlippageWarning && (
                    <WarningOctagon weight="fill" color={theme.colors.caution} size={16} />
                  )}
                  {formatNumber(slippage * 100)}%
                  <img alt={t('SLIPPAGE')} src={SlippageEditIcon} />
                </SlippageButton>
              </ListingDescriptionRow>
            )}
            <ListingDescriptionRow>
              <StyledP typography="body_medium_m" color="white_200">
                {t('SWAP_SCREEN.MIN_RECEIVE')}
              </StyledP>
              <StyledP data-testid="min-received-amount" typography="body_medium_m" color="white_0">
                <FormattedNumber number={formatBalance(quote.receiveAmount)} tokenSymbol={toUnit} />
              </StyledP>
            </ListingDescriptionRow>
            {Boolean(quote.feePercentage) && (
              <ListingDescriptionRow>
                <StyledP typography="body_medium_m" color="white_200">
                  {t('SWAP_SCREEN.LP_FEE')}
                </StyledP>
                <StyledP typography="body_medium_m" color="white_0">
                  {formatNumber(quote.feePercentage)}%
                </StyledP>
              </ListingDescriptionRow>
            )}
            {Boolean(quote.feeFlat) && (
              <ListingDescriptionRow>
                <StyledP typography="body_medium_m" color="white_200">
                  {t('SWAP_SCREEN.LP_FEE')}
                </StyledP>
                <StyledP typography="body_medium_m" color="white_0">
                  {formatNumber(quote.feeFlat)} {feeUnits}
                </StyledP>
              </ListingDescriptionRow>
            )}
            <ListingDescriptionRow>
              <StyledP typography="body_medium_m" color="white_200">
                {t('SWAP_SCREEN.ROUTE')}
              </StyledP>
              <StyledP typography="body_medium_m" color="white_0">
                <RouteContainer>
                  {fromUnit}
                  <ArrowRight weight="bold" color={theme.colors.white_400} size={16} />
                  {toUnit}
                </RouteContainer>
              </StyledP>
            </ListingDescriptionRow>
            {fromToken && toToken && isRunesTx({ fromToken, toToken }) && (
              <ListingDescriptionRow>
                <StyledP typography="body_medium_m" color="white_200">
                  {t('TRANSACTION_SETTING.FEE_RATE')}
                  <EditFeeRateContainer>
                    <EditFee
                      feeUnits={feeUnits}
                      feeRate={feeRate}
                      feeRateUnits={t('UNITS.SATS_PER_VB')}
                      setFeeRate={setFeeRate}
                      // We only know the rate, not the absolute amount
                      // It is impossible to determine the fiat value
                      baseToFiat={() => ''}
                      fiatUnit={fiatCurrency}
                      getFeeForFeeRate={(fee) => Promise.resolve(fee)}
                      feeRates={{
                        medium: recommendedFees?.regular,
                        high: recommendedFees?.priority,
                      }}
                      feeRateLimits={{ ...recommendedFees?.limits, min: recommendedFees?.regular }}
                      onFeeChange={setFeeRate}
                    />
                  </EditFeeRateContainer>
                </StyledP>
                <FeeRate data-testid="fee-amount">
                  {feeRate} {t('UNITS.SATS_PER_VB')}
                </FeeRate>
              </ListingDescriptionRow>
            )}
          </ListingDescContainer>
        </Flex1>
        <SendButtonContainer>
          <Button
            variant="primary"
            title={t('SWAP_SCREEN.SWAP')}
            onClick={handleSwap}
            loading={isPlaceOrderLoading || isPlaceUtxoOrderLoading}
            disabled={feeRate === '0'}
          />
        </SendButtonContainer>
        <Sheet
          title={t('SWAP_SCREEN.SLIPPAGE_TITLE')}
          visible={showSlippageModal}
          onClose={() => setShowSlippageModal(false)}
        >
          <SlippageModalContent
            defaultSlippage={DEFAULT_SLIPPAGE}
            slippage={slippage}
            slippageThreshold={quote.slippageThreshold}
            slippageDecimals={quote.slippageDecimals}
            onChange={(newSlippage) => {
              setSlippage(newSlippage);
              setShowSlippageModal(false);
            }}
          />
        </Sheet>
      </Container>
    </>
  );
}
