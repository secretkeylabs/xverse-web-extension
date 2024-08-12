import SlippageEditIcon from '@assets/img/swap/slippageEdit.svg';
import TopRow from '@components/topRow';
import useRuneFloorPriceQuery from '@hooks/queries/runes/useRuneFloorPriceQuery';
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
  type FungibleToken,
  type MarketUtxo,
  type PlaceUtxoOrderRequest,
  type Quote,
  type Token,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import { formatNumber } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import trackSwapMixPanel from '../mixpanel';
import QuoteTile from '../quotesModal/quoteTile';
import { SlippageModalContent } from '../slippageModal';
import type { OrderInfo } from '../types';
import { mapFTNativeSwapTokenToTokenBasic } from '../utils';
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
  fromToken?: FungibleToken | 'BTC';
  toToken?: Token;
  quote: Quote;
  onClose: () => void;
  onChangeProvider: () => void;
  onError: (errorMessage: string) => void;
  onOrderPlaced: ({ order, providerCode }: OrderInfo) => void;
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
  onError,
  selectedIdentifiers,
}: QuoteSummaryProps) {
  const { t } = useTranslation('translation');
  const theme = useTheme();
  const { btcFiatRate } = useCoinRates();
  const { btcAddress, ordinalsAddress, btcPublicKey, ordinalsPublicKey } = useSelectedAccount();
  const { loading: isPlaceOrderLoading, error: placeOrderError, placeOrder } = usePlaceOrder();
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

  const fromUnit =
    fromToken === 'BTC'
      ? 'Sats'
      : (fromToken as FungibleToken)?.runeSymbol ?? RUNE_DISPLAY_DEFAULTS.symbol;

  const toUnit =
    toToken?.protocol === 'btc' ? 'Sats' : toToken?.symbol ?? RUNE_DISPLAY_DEFAULTS.symbol;

  const [showSlippageModal, setShowSlippageModal] = useState(false);
  const [slippage, setSlippage] = useSearchParamsState('slippage', 0.05);

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
      btcFiatRate,
      runeFloorPrice,
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
    } else {
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
    }
  };

  const feeUnits = toToken?.protocol === 'sip10' || toToken?.protocol === 'stx' ? 'STX' : 'Sats';

  const showSlippageWarning = Boolean(
    quote.slippageSupported && quote.slippageThreshold && slippage > quote.slippageThreshold,
  );

  return (
    <>
      <TopRow onClick={onClose} />
      <Container>
        <StyledP typography="headline_s" color="white_0">
          {t('SWAP_SCREEN.QUOTE')}
        </StyledP>
        <Flex1>
          <QuoteSummaryTile
            fromUnit={fromUnit}
            toUnit={toUnit}
            rate={
              toToken?.protocol === 'btc'
                ? new BigNumber(quote.receiveAmount).dividedBy(new BigNumber(amount)).toString()
                : new BigNumber(amount).dividedBy(new BigNumber(quote.receiveAmount)).toString()
            }
            provider={quote.provider.name}
            image={quote.provider.logo}
            onClick={onChangeProvider}
          />
          <QuoteToBaseContainer>
            <QuoteTile
              provider="Amount"
              price={amount}
              image={{
                currency: fromToken === 'BTC' ? 'BTC' : 'FT',
                ft: fromToken === 'BTC' ? undefined : fromToken,
              }}
              subtitle={fromToken === 'BTC' ? 'Bitcoin' : fromToken?.assetName}
              subtitleColor="white_400"
              unit={fromToken === 'BTC' ? 'Sats' : fromToken?.runeSymbol ?? ''}
              fiatValue={
                fromToken === 'BTC'
                  ? getBtcFiatEquivalent(new BigNumber(amount), new BigNumber(btcFiatRate)).toFixed(
                      2,
                    )
                  : new BigNumber(fromToken?.tokenFiatRate ?? 0).multipliedBy(amount).toFixed(2)
              }
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
                currency: toToken?.protocol === 'btc' ? 'BTC' : 'FT',
                ft:
                  toToken?.protocol === 'btc'
                    ? undefined
                    : ({
                        runeSymbol: toToken?.symbol,
                        runeInscriptionId: toToken?.logo,
                        ticker: toToken?.name,
                        protocol: 'runes',
                      } as FungibleToken),
              }}
              subtitle={toToken?.protocol === 'btc' ? 'Bitcoin' : toToken?.name}
              subtitleColor="white_400"
              unit={toToken?.protocol === 'btc' ? 'Sats' : toToken?.symbol}
              fiatValue={
                toToken?.protocol === 'btc'
                  ? getBtcFiatEquivalent(
                      new BigNumber(quote.receiveAmount),
                      new BigNumber(btcFiatRate),
                    ).toFixed(2)
                  : getBtcFiatEquivalent(
                      new BigNumber(runeFloorPrice ?? 0).multipliedBy(quote.receiveAmount),
                      new BigNumber(btcFiatRate),
                    ).toFixed(2)
              }
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
                  {slippage * 100}%
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
