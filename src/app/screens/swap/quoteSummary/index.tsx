import SlippageEditIcon from '@assets/img/swap/slippageEdit.svg';
import TopRow from '@components/topRow';
import useRuneFloorPriceQuery from '@hooks/queries/runes/useRuneFloorPriceQuery';
import useGetSip10TokenInfo from '@hooks/queries/stx/useGetSip10TokenInfo';
import useCoinRates from '@hooks/queries/useCoinRates';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useSearchParamsState from '@hooks/useSearchParamsState';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowDown, ArrowRight, WarningOctagon } from '@phosphor-icons/react';
import {
  AnalyticsEvents,
  RUNE_DISPLAY_DEFAULTS,
  getBtcFiatEquivalent,
  getStxFiatEquivalent,
  stxToMicrostacks,
  type FungibleToken,
  type MarketUtxo,
  type PlaceUtxoOrderRequest,
  type Quote,
  type Token,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import { formatNumber } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import trackSwapMixPanel from '../mixpanel';
import QuoteTile from '../quotesModal/quoteTile';
import SlippageModalContent from '../slippageModal';
import type { OrderInfo, StxOrderInfo } from '../types';
import {
  BAD_QUOTE_PERCENTAGE,
  isRunesTx,
  mapFTNativeSwapTokenToTokenBasic,
  mapFtToCurrencyType,
  mapSwapTokenToFT,
  mapTokenToCurrencyType,
} from '../utils';
import EditFee from './EditFee';
import QuoteSummaryTile from './quoteSummaryTile';
import usePlaceOrder from './usePlaceOrder';
import usePlaceUtxoOrder from './usePlaceUtxoOrder';

const SlippageButton = styled.button<{ showWarning: boolean }>`
  display: flex;
  flex-direction: row;
  column-gap: ${(props) => props.theme.space.xxs};
  background: transparent;
  align-items: center;
  ${(props) => props.theme.typography.body_medium_m};
  border-radius: 24px;
  border: 1px solid ${(props) => props.theme.colors.white_800};
  padding: ${(props) => props.theme.space.xxs} ${(props) => props.theme.space.s};
  color: ${(props) =>
    props.showWarning ? props.theme.colors.caution : props.theme.colors.white_0};
`;
const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: `0 ${props.theme.space.m} ${props.theme.space.l} ${props.theme.space.m}`,
  zIndex: 1,
  backgroundColor: props.theme.colors.elevation0,
}));

const CalloutContainer = styled.div`
  margin-bottom: ${(props) => props.theme.space.m};
`;

const Flex1 = styled.div`
  flex: 1;
  margin-top: 12px;
`;

const SendButtonContainer = styled.div((props) => ({
  marginBottom: props.theme.space.s,
}));

const ListingDescContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.m,
}));

const ListingDescriptionRow = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  flex: 1;
  justify-content: space-between;
  min-height: 24px;
`;

const RouteContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  gap: 4px;
`;

const QuoteToBaseContainer = styled.div`
  margin-top: 4px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ArrowOuterContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const ArrowInnerContainer = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border: 1px solid ${(props) => props.theme.colors.white_850};
  background-color: ${(props) => props.theme.colors.background.elevation0};
  padding: 8px;
`;

const EditFeeRateContainer = styled.div`
  margin-top: ${(props) => props.theme.space.xxs};
`;

const FeeRate = styled.div`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_0};
  display: flex;
  flex-direction: row;
  align-self: flex-start;
`;

type QuoteSummaryProps = {
  amount: string;
  fromToken?: FungibleToken;
  toToken?: Token;
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
}: QuoteSummaryProps) {
  const { t } = useTranslation('translation');
  const { tokenInfo: sip10ToTokenInfoUSD } = useGetSip10TokenInfo({
    principal: toToken?.ticker,
    fiatCurrency: 'USD',
  });

  const { tokenInfo: sip10ToTokenInfo } = useGetSip10TokenInfo({
    principal: toToken?.ticker,
  });

  const { tokenInfo: sip10FromTokenInfoUSD } = useGetSip10TokenInfo({
    principal: fromToken?.principal,
    fiatCurrency: 'USD',
  });

  const theme = useTheme();
  const { btcFiatRate, btcUsdRate, stxBtcRate } = useCoinRates();
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
    if (toToken?.protocol === 'btc') {
      return 'Sats';
    }
    if (toToken?.symbol) {
      return toToken.symbol;
    }
    if (toToken?.protocol === 'runes') {
      return RUNE_DISPLAY_DEFAULTS.symbol;
    }
    if (toToken?.ticker === 'STX') {
      return 'STX';
    }
    return toToken?.name;
  })();

  const isRunesSwap = fromToken?.protocol === 'runes' || toToken?.protocol === 'runes';
  const isSip10Swap = fromToken?.protocol === 'stacks' || toToken?.protocol === 'sip10';

  const [showSlippageModal, setShowSlippageModal] = useState(false);
  const DEFAULT_SLIPPAGE = quote.slippageThreshold ?? 0.05;
  const [slippage, setSlippage] = useSearchParamsState('slippage', DEFAULT_SLIPPAGE);

  const handleSwap = async () => {
    if (!fromToken || !toToken) {
      return;
    }

    trackSwapMixPanel(AnalyticsEvents.ConfirmSwap, {
      provider: quote.provider,
      fromToken,
      toToken,
      amount,
      quote,
      btcUsdRate,
      runeFloorPrice,
      stxBtcRate,
      fromTokenInfo: sip10FromTokenInfoUSD,
    });

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
        onStxOrderPlaced({ order: placeOrderResponse, providerCode: quote.provider.code });
      }
    }
  };

  const feeUnits = toToken?.protocol === 'sip10' || toToken?.protocol === 'stx' ? 'STX' : 'Sats';

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
    if (toToken?.protocol === 'btc') {
      return getBtcFiatEquivalent(
        new BigNumber(quote.receiveAmount),
        new BigNumber(btcFiatRate),
      ).toFixed(2);
    }
    if (toToken?.protocol === 'runes') {
      return getBtcFiatEquivalent(
        new BigNumber(runeFloorPrice ?? 0).multipliedBy(quote.receiveAmount),
        new BigNumber(btcFiatRate),
      ).toFixed(2);
    }
    if (toToken?.protocol === 'stx') {
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

  const showBadQuoteWarning =
    quote.slippageSupported &&
    new BigNumber(toTokenFiatValue).isLessThan(
      new BigNumber(fromTokenFiatValue).multipliedBy(BAD_QUOTE_PERCENTAGE),
    );
  const valueLossPercentage = new BigNumber(fromTokenFiatValue)
    .minus(new BigNumber(toTokenFiatValue))
    .dividedBy(new BigNumber(fromTokenFiatValue))
    .multipliedBy(100)
    .toFixed(0);

  const getTokenRate = (): string => {
    if (toToken?.protocol === 'btc') {
      return new BigNumber(quote.receiveAmount)
        .dividedBy(new BigNumber(amount))
        .decimalPlaces(2)
        .toString();
    }
    const satsPerRune = new BigNumber(amount).dividedBy(new BigNumber(quote.receiveAmount));
    return new BigNumber(1).dividedBy(satsPerRune).toString();
  };

  return (
    <>
      <TopRow onClick={onClose} />

      <Container>
        {showBadQuoteWarning && (
          <CalloutContainer>
            <Callout
              titleText={t('SWAP_SCREEN.BAD_QUOTE_WARNING_TITLE')}
              bodyText={t('SWAP_SCREEN.BAD_QUOTE_WARNING_DESC', {
                percentage: valueLossPercentage,
              })}
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
            provider={quote.provider.name}
            image={quote.provider.logo}
            onClick={onChangeProvider}
          />
          <QuoteToBaseContainer>
            <QuoteTile
              provider="Amount"
              price={amount}
              image={{
                currency: mapFtToCurrencyType(fromToken),
                ft:
                  fromToken?.principal === 'BTC' || fromToken?.principal === 'STX'
                    ? undefined
                    : fromToken,
              }}
              subtitle={
                fromToken?.principal === 'BTC'
                  ? 'Bitcoin'
                  : fromToken?.assetName !== ''
                  ? fromToken?.assetName
                  : fromToken?.name
              }
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
              image={{
                currency: mapTokenToCurrencyType(toToken),
                ft:
                  toToken?.protocol === 'runes'
                    ? ({
                        runeSymbol: toToken?.symbol,
                        runeInscriptionId: toToken?.logo,
                        ticker: toToken?.name,
                        protocol: 'runes',
                      } as FungibleToken)
                    : toToken?.protocol === 'sip10'
                    ? mapSwapTokenToFT(toToken)
                    : undefined,
              }}
              subtitle={toToken?.protocol === 'btc' ? 'Bitcoin' : toToken?.name}
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
                  showWarning={showSlippageWarning}
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
                {formatNumber(quote.receiveAmount)} {toUnit}
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
