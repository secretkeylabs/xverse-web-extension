import SlippageEditIcon from '@assets/img/swap/slippageEdit.svg';
import TopRow from '@components/topRow';
import useCoinRates from '@hooks/queries/useCoinRates';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowDown, ArrowRight } from '@phosphor-icons/react';
import {
  getBtcFiatEquivalent,
  type ExecuteOrderRequest,
  type FungibleToken,
  type PlaceOrderResponse,
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
import QuoteTile from '../quotesModal/quoteTile';
import { SlippageModalContent } from '../slippageModal';
import { mapFTNativeSwapTokenToTokenBasic } from '../utils';
import EditFee from './EditFee';
import QuoteSummaryTile from './quoteSummaryTile';
import usePlaceOrder from './usePlaceOrder';

const SlippageButton = styled.button`
  display: flex;
  flex-direction: row;
  column-gap: ${(props) => props.theme.space.xxs};
  background: transparent;
  align-items: center;
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_0};
  border-radius: 24px;
  border: 1px solid ${(props) => props.theme.colors.white_800};
  padding: 1.75px 10px;
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
  justify-content: right;
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
  onOrderPlaced: ({
    order,
    providerCode,
  }: {
    order: PlaceOrderResponse;
    providerCode: ExecuteOrderRequest['providerCode'];
  }) => void;
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
}: QuoteSummaryProps) {
  const { t } = useTranslation('translation');
  const theme = useTheme();
  const { btcFiatRate } = useCoinRates();
  const { btcAddress, ordinalsAddress, btcPublicKey, ordinalsPublicKey } = useSelectedAccount();
  const { loading: isPlaceOrderLoading, error: placeOrderError, placeOrder } = usePlaceOrder();

  useEffect(() => {
    if (placeOrderError) {
      onError(placeOrderError);
    }
  }, [placeOrderError]);

  const { data: recommendedFees } = useBtcFeeRate();
  const [feeRate, setFeeRate] = useState('0');

  useEffect(() => {
    if (recommendedFees && feeRate === '0') {
      setFeeRate(recommendedFees.regular.toString());
    }
  }, [recommendedFees, feeRate]);

  const { fiatCurrency } = useWalletSelector();

  const satsToFiat = (sats: string) =>
    getBtcFiatEquivalent(new BigNumber(sats), BigNumber(btcFiatRate)).toString();

  const fromUnit =
    fromToken === 'BTC'
      ? 'BTC'
      : (fromToken as FungibleToken)?.runeSymbol || (fromToken as FungibleToken)?.ticker;

  const toUnit = toToken?.protocol === 'btc' ? 'SATS' : toToken?.symbol ?? toToken?.ticker;

  const [showSlippageModal, setShowSlippageModal] = useState(false);
  const [slippage, setSlippage] = useState(0.05);

  const handleSwap = async () => {
    if (!fromToken || !toToken) {
      return;
    }

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
  };

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
            rate={new BigNumber(quote.receiveAmount).dividedBy(new BigNumber(amount)).toString()}
            provider={quote.provider.name}
            image={quote.provider.logo}
            onClick={onChangeProvider}
          />
          <QuoteToBaseContainer>
            <QuoteTile
              provider="Amount"
              price={amount}
              // TODO JORDAN: ADD RUNE SYMBOL OVERLAY
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
                  : // TODO JORDAN: ADD RUNE FIAT EQUIVALENT
                    ''
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
                  : ''
              }
            />
          </QuoteToBaseContainer>

          <ListingDescContainer>
            {quote.slippageSupported && (
              <ListingDescriptionRow>
                <StyledP typography="body_medium_m" color="white_200">
                  {t('SWAP_SCREEN.SLIPPAGE')}
                </StyledP>
                <SlippageButton onClick={() => setShowSlippageModal(true)}>
                  {slippage * 100}%
                  <img alt={t('SLIPPAGE')} src={SlippageEditIcon} />
                </SlippageButton>
              </ListingDescriptionRow>
            )}
            <ListingDescriptionRow>
              <StyledP typography="body_medium_m" color="white_200">
                {t('SWAP_SCREEN.MIN_RECEIVE')}
              </StyledP>
              <StyledP typography="body_medium_m" color="white_0">
                {formatNumber(quote.receiveAmount)} {toUnit}
              </StyledP>
            </ListingDescriptionRow>
            <ListingDescriptionRow>
              <StyledP typography="body_medium_m" color="white_200">
                {t('SWAP_SCREEN.LP_FEE')}
              </StyledP>
              <StyledP typography="body_medium_m" color="white_0">
                {formatNumber(quote.feePercentage)}%
              </StyledP>
            </ListingDescriptionRow>
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
                    feeUnits="Sats"
                    feeRate={feeRate}
                    feeRateUnits={t('UNITS.SATS_PER_VB')}
                    setFeeRate={setFeeRate}
                    baseToFiat={satsToFiat}
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
              <FeeRate>
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
            loading={isPlaceOrderLoading}
          />
        </SendButtonContainer>
        <Sheet
          title={t('SWAP_SCREEN.SLIPPAGE_TITLE')}
          visible={showSlippageModal}
          onClose={() => setShowSlippageModal(false)}
        >
          <SlippageModalContent
            slippage={slippage}
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
