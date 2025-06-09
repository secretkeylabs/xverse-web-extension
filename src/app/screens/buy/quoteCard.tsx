import styled, { css, keyframes } from 'styled-components';

import type { BuyQuoteSuccess, PaymentMethod } from '@hooks/queries/onramp/client/types';
import useGetOnrampMetadata from '@hooks/queries/onramp/useGetOnrampMetadata';
import useInitiateTransaction from '@hooks/queries/onramp/useInitiateTransaction';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { currencySymbolMap } from '@secretkeylabs/xverse-core';
import ActionCard from '@ui-library/actionCard';
import { formatNumber } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isFiatCurrencyConversionSupported, SUPPORTED_CRYPTO_CURRENCIES } from './utils';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const QuoteActionCard = styled(ActionCard)<{ $animate: boolean }>`
  width: 100%;
  gap: ${(props) => props.theme.space.s};
  opacity: ${(props) => (props.$animate ? 0 : 1)};
  ${(props) =>
    props.$animate &&
    css`
      animation: ${fadeIn} 0.5s ease forwards;
    `}
`;

const QuoteCardContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  gap: props.theme.space.s,
}));

const QuoteCardContent = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',

  '& .quote-card-content': {
    display: 'flex',
    flexDirection: 'column',
    gap: props.theme.space.xxxs,
  },
}));

const QuoteCardText = styled.div((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
}));

const QuoteCardSubText = styled.div((props) => ({
  ...props.theme.typography.body_medium_s,
  color: props.theme.colors.white_200,
  textAlign: 'right',
}));

const QuoteCardRecommendation = styled.div((props) => ({
  ...props.theme.typography.body_medium_s,
  color: props.theme.colors.success_light,
}));

const QuoteImage = styled.img<{ $size?: number }>((props) => ({
  padding: props.theme.space.xxs,
  borderRadius: 100,
  backgroundColor: props.theme.colors.white_0,
  width: props.$size ?? 40,
}));

type Props = {
  quote: BuyQuoteSuccess;
  buyAmount: string;
  buyingFiatCurrency: string;
  cryptoToBuy: (typeof SUPPORTED_CRYPTO_CURRENCIES)[number];
  paymentMethod: PaymentMethod;
  showRecommendations?: boolean;
  closeBuyQuotesSheet: () => void;
  onLoadingChange: (isLoading: boolean) => void;
};

function QuoteCard({
  quote,
  buyAmount,
  buyingFiatCurrency,
  cryptoToBuy,
  paymentMethod,
  showRecommendations = false,
  closeBuyQuotesSheet,
  onLoadingChange,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'BUY_SCREEN' });

  const [animate, setAnimate] = useState(true);

  const isSelectedFiatCurrencyConversionSupported =
    isFiatCurrencyConversionSupported(buyingFiatCurrency);
  const { btcAddress, stxAddress } = useSelectedAccount();

  const receivingWallet = cryptoToBuy.symbol === 'BTC' ? btcAddress : stxAddress;

  const onrampMetadata = useGetOnrampMetadata();
  const { stxBtcRate, btcFiatRate } = useSupportedCoinRates(
    isSelectedFiatCurrencyConversionSupported ? buyingFiatCurrency : undefined,
  );
  const initiateTransaction = useInitiateTransaction();

  if (!onrampMetadata.isSuccess) {
    return null;
  }

  const convertQuoteToFiat = () => {
    // If our API doesn't provide the rate for selected currency
    // we use the rate from Onrampers API response
    if (!isSelectedFiatCurrencyConversionSupported) {
      return quote.payout * quote.rate;
    }

    const btcRate = Number(btcFiatRate) || 0;
    const stxRate = Number(stxBtcRate) || 0;

    if (cryptoToBuy.symbol === 'BTC') {
      return quote.payout * btcRate;
    }

    if (cryptoToBuy.symbol === 'STX') {
      return quote.payout * (btcRate * stxRate);
    }
  };

  const handleClickQuoteCard = () => {
    onLoadingChange(true);
    initiateTransaction.mutate(
      {
        source: buyingFiatCurrency.toLowerCase(),
        destination: cryptoToBuy.onramperId,
        amount: Number(buyAmount),
        onramp: quote.ramp,
        walletAddress: receivingWallet,
        paymentMethod: paymentMethod.paymentTypeId,
        network: cryptoToBuy.network,
        uuid: receivingWallet,
      },
      {
        onSuccess: (initiateTransactionResponse) => {
          closeBuyQuotesSheet();

          // Open the transaction url in a new tab
          window.open(initiateTransactionResponse.message.transactionInformation.url, '_blank');
        },
        onSettled: () => {
          onLoadingChange(false);
        },
      },
    );
  };

  const fiatRate = convertQuoteToFiat();

  const onrampData = onrampMetadata.data.message.find((onramp) => onramp.id === quote.ramp);

  const showRecommendationLabel =
    showRecommendations &&
    quote.recommendations &&
    quote.recommendations.length > 0 &&
    t(`ONRAMP_LABELS.${[quote.recommendations[0]]}`) !== t('ONRAMP_LABELS.ClientPreference'); // Hide custom routing rule label

  return (
    <QuoteActionCard
      withArrow
      $animate={animate}
      onAnimationEnd={() => setAnimate(false)}
      onClick={handleClickQuoteCard}
      label={
        <QuoteCardContainer>
          <QuoteImage $size={24} src={onrampData?.icon} alt={`${quote.ramp} icon`} />
          <QuoteCardContent>
            <div className="quote-card-content">
              <QuoteCardText>{onrampData?.displayName}</QuoteCardText>
              {showRecommendationLabel && (
                <QuoteCardRecommendation>
                  • {t(`ONRAMP_LABELS.${[quote.recommendations![0]]}`)}
                </QuoteCardRecommendation>
              )}
            </div>
            <div className="quote-card-content">
              <QuoteCardText>
                {cryptoToBuy.symbol === 'BTC'
                  ? quote.payout.toFixed(8).replace(/\.?0+$/, '')
                  : quote.payout.toFixed(6)}{' '}
                {cryptoToBuy.symbol}
              </QuoteCardText>
              {fiatRate && (
                <QuoteCardSubText>
                  ~{currencySymbolMap[buyingFiatCurrency]}
                  {formatNumber(fiatRate.toFixed(2))} {buyingFiatCurrency}
                </QuoteCardSubText>
              )}
            </div>
          </QuoteCardContent>
        </QuoteCardContainer>
      }
    />
  );
}

export default QuoteCard;
