import type {
  BuyQuote,
  BuyQuoteError,
  BuyQuoteSuccess,
  FetchBuyQuotesResponse,
  QuoteError,
} from '@hooks/queries/onramp/client/types';
import { currencySymbolMap, type SupportedCurrency } from '@secretkeylabs/xverse-core';
import { formatNumber } from '@utils/helper';
import type { TFunction } from 'react-i18next';

const PRESET_AMOUNTS = {
  USD: ['100', '500', '1000'],
  EUR: ['100', '500', '1000'],
  CNY: ['700', '3500', '7000'],
  JPY: ['11000', '55000', '110000'],
  GBP: ['100', '450', '900'],
  INR: ['2000', '10000', '20000'],
  RUB: ['1500', '7500', '15000'],
  BRL: ['300', '1500', '3000'],
  KRW: ['130000', '650000', '1300000'],
  CAD: ['100', '550', '1100'],
  AUD: ['100', '600', '1200'],
  MXN: ['1200', '6000', '12000'],
  IDR: ['1400000', '7000000', '14000000'],
  TRY: ['1000', '5000', '10000'],
  SAR: ['400', '1900', '3800'],
  ZAR: ['1200', '6000', '12000'],
  CHF: ['100', '450', '900'],
};

export const DEFAULT_PAYMENT_METHOD_IMG =
  'https://cdn.onramper.com/icons/payments/banktransfer.svg';

export const getPresetValuesByCurrencyCode = (code: string): string[] | null =>
  PRESET_AMOUNTS[code] ?? null;

export const SUPPORTED_CRYPTO_CURRENCIES = [
  { name: 'Bitcoin', symbol: 'BTC', onramperId: 'btc', network: 'bitcoin' },
  { name: 'Stacks', symbol: 'STX', onramperId: 'stx_stacks', network: 'stacks' },
] as const;

export function convertFiatToCrypto(
  buyAmount: string,
  btcFiatRate: string,
  stxBtcRate: string,
  selectedCrypto: 'BTC' | 'STX',
) {
  const fiatValue = Number(buyAmount) || 0;
  const btcRate = Number(btcFiatRate) || 0;
  const stxRate = Number(stxBtcRate) || 0;

  if (fiatValue <= 0 || btcRate <= 0 || stxRate <= 0) {
    return 0;
  }

  if (selectedCrypto === 'BTC') {
    return (fiatValue / btcRate).toFixed(8).replace(/\.?0+$/, '');
  }

  if (selectedCrypto === 'STX') {
    // Convert fiat -> BTC then BTC -> STX
    return (fiatValue / (btcRate * stxRate)).toFixed(6);
  }
}

export function isFiatCurrencyConversionSupported(
  buyingFiatCurrency: string | SupportedCurrency,
): buyingFiatCurrency is SupportedCurrency {
  return Object.keys(currencySymbolMap).includes(buyingFiatCurrency);
}

interface SplitQuotes {
  recommended: BuyQuoteSuccess[];
  other: BuyQuoteSuccess[];
}

// Type guard to check if a quote is a successful quote (not an error quote)
function isSuccessfulQuote(quote: BuyQuote): quote is BuyQuoteSuccess {
  return !('errors' in quote && Array.isArray(quote.errors) && quote.errors.length > 0);
}

export function splitQuotes(quotes: FetchBuyQuotesResponse) {
  const validQuotes = quotes.filter(isSuccessfulQuote);

  const groupedQuotes = validQuotes.reduce<SplitQuotes>(
    (acc, quote) => {
      if (quote.recommendations && quote.recommendations.length > 0) {
        acc.recommended.push(quote);
      } else {
        acc.other.push(quote);
      }
      return acc;
    },
    { recommended: [], other: [] },
  );

  return { recommended: groupedQuotes.recommended, other: groupedQuotes.other };
}

export function handleKeyDownNumberInput(e: React.KeyboardEvent<HTMLInputElement>) {
  // 1) allow control keys (Backspace, Delete, arrows, Tab…)
  if (e.key.length > 1) return;

  // 2) allow only digits or dot
  if (!/^[0-9.]$/.test(e.key)) {
    e.preventDefault();
    return;
  }

  const input = e.currentTarget;
  const { value } = input;

  // 3) if empty & user types '.', make it '0.'
  if (value === '' && e.key === '.') {
    e.preventDefault();
    input.value = '0.';
    return;
  }

  // 4) if the field is exactly "0" and they type a digit, replace the zero
  if (value === '0' && /^[0-9]$/.test(e.key)) {
    e.preventDefault();
    input.value = e.key;
    return;
  }

  // 5) prevent a second decimal point
  if (e.key === '.' && value.includes('.')) {
    e.preventDefault();
  }
}

function isErrorQuote(q: BuyQuote): q is BuyQuoteError {
  return Array.isArray((q as BuyQuoteError).errors);
}

export function allQuotesAreErrors(quotes: BuyQuote[]): boolean {
  return quotes.length > 0 && quotes.every(isErrorQuote);
}

// Find a “limit” error if one exists
function findLimitError(
  quotes: BuyQuoteError[],
): (QuoteError & { minAmount: number; maxAmount: number }) | undefined {
  return quotes
    .flatMap((q) => q.errors)
    .find(
      (e): e is QuoteError & { minAmount: number; maxAmount: number } =>
        e.type === 'LimitMismatch' && 'minAmount' in e && 'maxAmount' in e,
    );
}

export function getQuotesErrorMessage(
  quotes: BuyQuoteError[],
  t: TFunction,
  buyingFiatCurrency: string,
  options?: { onLimitErrorFound?: (limitErr: { minAmount: number; maxAmount: number }) => void },
): string {
  // Everything is “no support at all”
  if (
    quotes.every((q) =>
      q.errors.every(
        (e) => e.type === 'NoSupportedPaymentFound' || e.type === 'QuoteParameterMismatch',
      ),
    )
  ) {
    return t('ERRORS.NO_QUOTES_FOR_PARAMS');
  }

  // At least one provider says “you’re outside our limits”
  const limitErr = findLimitError(quotes.filter(isErrorQuote));
  if (limitErr) {
    options?.onLimitErrorFound?.(limitErr);

    const minBuyAmount = `${currencySymbolMap[buyingFiatCurrency] ?? ''}${formatNumber(
      limitErr.minAmount.toFixed(2),
    )} ${buyingFiatCurrency}`;

    const maxBuyAmount = `${currencySymbolMap[buyingFiatCurrency] ?? ''}${formatNumber(
      limitErr.maxAmount.toFixed(2),
    )} ${buyingFiatCurrency}`;

    return t('ERRORS.NO_QUOTES_BETWEEN', { minBuyAmount, maxBuyAmount });
  }

  return t('ERRORS.NO_QUOTES_FOR_PARAMS');
}
