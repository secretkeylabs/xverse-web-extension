import { Selection } from '@phosphor-icons/react';
import { currencySymbolMap } from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PaymentMethod } from '@hooks/queries/onramp/client/types';
import useGetBuyQuotes, {
  REFETCH_QUOTES_INTERVAL_SECONDS,
} from '@hooks/queries/onramp/useGetBuyQuotes';
import useGetOnrampMetadata from '@hooks/queries/onramp/useGetOnrampMetadata';
import { formatNumber } from '@utils/helper';
import Theme from 'theme';

import { SheetSelect } from '../index.styled';
import QuoteCard from '../quoteCard';
import { splitQuotes, SUPPORTED_CRYPTO_CURRENCIES } from '../utils';
import {
  LoadingOverlay,
  LoadingSpinnerContainer,
  QuoteList,
  QuoteListLoadingWrapper,
  QuotesDescriptionContainer,
  QuotesList,
  QuotesListContainer,
  QuotesListSection,
  QuotesListSectionTitle,
  SheetErrorContainer,
  SheetErrorContent,
  TryAgainButton,
} from './index.styled';

type Props = {
  visible: boolean;
  onClose: () => void;
  buyQuotes: ReturnType<typeof useGetBuyQuotes>;
  buyAmount: string;
  buyingFiatCurrency: string;
  cryptoToBuy: (typeof SUPPORTED_CRYPTO_CURRENCIES)[number];
  paymentMethod: PaymentMethod;
};

function GetBuyQuotes({
  visible,
  onClose,
  buyQuotes,
  buyAmount,
  buyingFiatCurrency,
  cryptoToBuy,
  paymentMethod,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'BUY_SCREEN' });

  const onrampMetadata = useGetOnrampMetadata();

  const quotes = buyQuotes.data ? splitQuotes(buyQuotes.data) : { recommended: [], other: [] };
  const isQuotesEmpty = quotes.recommended.length === 0 && quotes.other.length === 0;

  const [timeLeft, setTimeLeft] = useState(REFETCH_QUOTES_INTERVAL_SECONDS);
  const [isAnyQuotesLoading, setIsAnyQuotesLoading] = useState(false);

  const handleLoadingChange = (isLoading: boolean) => {
    setIsAnyQuotesLoading(isLoading);
  };

  // Reset the timer whenever the component becomes visible or new quotes data is fetched.
  useEffect(() => {
    if (!visible || isQuotesEmpty || buyQuotes.isFetching) return;

    setTimeLeft(REFETCH_QUOTES_INTERVAL_SECONDS);

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev === 0 ? prev : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, isQuotesEmpty, buyQuotes.isFetching]);

  useEffect(() => {
    if (!visible || isQuotesEmpty || timeLeft > 0 || buyQuotes.isFetching) return;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      await buyQuotes.refetch();
      setTimeLeft(REFETCH_QUOTES_INTERVAL_SECONDS);
    })();
  }, [visible, isQuotesEmpty, timeLeft, buyQuotes]);

  const formattedTime = `0:${timeLeft < 10 ? `0${timeLeft}` : timeLeft}`;

  const minBuyAmount = `${currencySymbolMap[buyingFiatCurrency] ?? ''}${formatNumber(
    paymentMethod.details.limits.aggregatedLimit?.min.toFixed(2),
  )} ${buyingFiatCurrency}`;

  const maxBuyAmount = `${currencySymbolMap[buyingFiatCurrency] ?? ''}${formatNumber(
    paymentMethod.details.limits.aggregatedLimit?.max.toFixed(2),
  )} ${buyingFiatCurrency}`;

  const isInitialLoading = onrampMetadata.isLoading && isQuotesEmpty;

  if (isInitialLoading) {
    return (
      <SheetSelect title={t('QUOTES')} visible={visible} onClose={onClose}>
        <LoadingSpinnerContainer>
          <Spinner color="white" size={20} />
          <div>{t('FETCHING_BEST_PRICES')}</div>
        </LoadingSpinnerContainer>
      </SheetSelect>
    );
  }

  return (
    <SheetSelect title={t('QUOTES')} visible={visible} onClose={onClose}>
      <QuoteListLoadingWrapper>
        {isAnyQuotesLoading && (
          <LoadingOverlay>
            <Spinner color="white" size={20} />
          </LoadingOverlay>
        )}
        <QuoteList $isVisable={!isAnyQuotesLoading}>
          {!isQuotesEmpty && (
            <QuotesDescriptionContainer>
              <div>{t('COMPARE_RATES')}</div>
              <div>
                {t('NEW_QUOTE_IN')} <span className="timer">{formattedTime}</span>
              </div>
            </QuotesDescriptionContainer>
          )}
          <QuotesListContainer>
            {isQuotesEmpty ? (
              <SheetErrorContainer>
                <Selection color={Theme.colors.white_400} size={40} />
                <SheetErrorContent>
                  <div className="title">{t('ERRORS.NO_QUOTES')}</div>
                  <div className="message">
                    {t('ERRORS.NO_QUOTES_BETWEEN', { minBuyAmount, maxBuyAmount })}
                  </div>
                </SheetErrorContent>
                <TryAgainButton title={t('TRY_AGAIN')} onClick={onClose} />
              </SheetErrorContainer>
            ) : (
              <>
                {quotes.recommended.length > 0 && (
                  <QuotesListSection>
                    <QuotesListSectionTitle>{t('RECOMMENDED_QUOTES')}</QuotesListSectionTitle>
                    <QuotesList>
                      {quotes.recommended.map((quote) => (
                        <li key={quote.quoteId}>
                          <QuoteCard
                            showRecommendations
                            quote={quote}
                            buyAmount={buyAmount}
                            buyingFiatCurrency={buyingFiatCurrency}
                            cryptoToBuy={cryptoToBuy}
                            paymentMethod={paymentMethod}
                            closeBuyQuotesSheet={onClose}
                            onLoadingChange={handleLoadingChange}
                          />
                        </li>
                      ))}
                    </QuotesList>
                  </QuotesListSection>
                )}
                {quotes.other.length > 0 && (
                  <QuotesListSection>
                    <QuotesListSectionTitle>{t('OTHER_QUOTES')}</QuotesListSectionTitle>
                    <QuotesList>
                      {quotes.other.map((quote) => (
                        <li key={quote.quoteId}>
                          <QuoteCard
                            quote={quote}
                            buyAmount={buyAmount}
                            buyingFiatCurrency={buyingFiatCurrency}
                            cryptoToBuy={cryptoToBuy}
                            paymentMethod={paymentMethod}
                            closeBuyQuotesSheet={onClose}
                            onLoadingChange={handleLoadingChange}
                          />
                        </li>
                      ))}
                    </QuotesList>
                  </QuotesListSection>
                )}
              </>
            )}
          </QuotesListContainer>
        </QuoteList>
      </QuoteListLoadingWrapper>
    </SheetSelect>
  );
}

export default GetBuyQuotes;
