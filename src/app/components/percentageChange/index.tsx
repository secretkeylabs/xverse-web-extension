import FormattedNumber from '@components/formattedNumber';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useGetCoinsMarketData from '@hooks/queries/useGetCoinsMarketData';
import useGetExchangeRate from '@hooks/queries/useGetExchangeRate';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useHasFeature from '@hooks/useHasFeature';
import useWalletSelector from '@hooks/useWalletSelector';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import type { ChartPriceStats } from '@screens/coinDashboard/tokenPrice';
import {
  currencySymbolMap,
  FeatureId,
  formatBalance,
  getFiatEquivalent,
  type FungibleToken,
} from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { EMPTY_LABEL, type CurrencyTypes } from '@utils/constants';
import { formatSignificantDecimals, getBalanceAmount } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import Theme from 'theme';

const NoDataTextContainer = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  marginRight: props.theme.space.xxs,
}));

const RowContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const PercentageChangeText = styled.p<{
  themeColor: string;
}>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.themeColor,
  marginLeft: props.theme.space.xxxs,
}));

const IntervalText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  marginLeft: props.theme.space.xs,
}));

const AmountChangeText = styled(StyledP)((props) => ({
  marginLeft: props.theme.space.xxs,
}));

type Props = {
  isHidden?: boolean;
  ftCurrencyPairs: [FungibleToken | undefined, CurrencyTypes][];
  decimals?: number;
  displayTimeInterval?: boolean;
  displayBalanceChange?: boolean;
  displayAmountChange?: boolean;
  chartPriceStats?: ChartPriceStats;
};

function PercentageChange({
  isHidden = false,
  ftCurrencyPairs,
  decimals = 2,
  displayTimeInterval = false,
  displayBalanceChange = false,
  displayAmountChange = false,
  chartPriceStats,
}: Props) {
  const { fiatCurrency } = useWalletSelector();
  const { data: exchangeRates } = useGetExchangeRate('USD');
  const exchangeRate = exchangeRates ? Number(exchangeRates[fiatCurrency]) : 1;

  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const { data: stxData } = useStxWalletData();
  const { data: btcBalance } = useBtcWalletData();

  const { data: btcMarketData } = useGetCoinsMarketData('bitcoin');
  const { data: stxMarketData } = useGetCoinsMarketData('blockstack');

  const showPortfolioTracking = useHasFeature(FeatureId.PORTFOLIO_TRACKING);
  if (!showPortfolioTracking) {
    return null;
  }

  let currentPrice = 0;
  const [currentBalance, oldBalance] = ftCurrencyPairs
    .map(([fungibleToken, currency]) => {
      const fiatBalance =
        currency &&
        getFiatEquivalent(
          Number(getBalanceAmount(currency, fungibleToken, stxData, btcBalance)),
          currency,
          BigNumber(stxBtcRate),
          BigNumber(btcFiatRate),
          fungibleToken,
        );

      if (!fiatBalance) {
        return [BigNumber(0), BigNumber(0)];
      }

      let priceChangePercentage24h = 0.0;

      if (fungibleToken) {
        if (!fungibleToken.priceChangePercentage24h || !fungibleToken.tokenFiatRate || !currency) {
          return [BigNumber(fiatBalance), BigNumber(fiatBalance)];
        }

        currentPrice = Number(fungibleToken.currentPrice || '0');
        priceChangePercentage24h = 100.0 + parseFloat(fungibleToken.priceChangePercentage24h);
      } else if (currency === 'BTC') {
        currentPrice = btcMarketData?.current_price || 0;
        priceChangePercentage24h = btcMarketData?.price_change_percentage_24h
          ? 100.0 + parseFloat(btcMarketData?.price_change_percentage_24h.toString())
          : 0;
      } else if (currency === 'STX') {
        currentPrice = stxMarketData?.current_price || 0;
        priceChangePercentage24h = stxMarketData?.price_change_percentage_24h
          ? 100.0 + parseFloat(stxMarketData?.price_change_percentage_24h.toString())
          : 0;
      }

      return priceChangePercentage24h
        ? [
            BigNumber(fiatBalance),
            BigNumber(fiatBalance).dividedBy(priceChangePercentage24h).multipliedBy(100),
          ]
        : [BigNumber(0), BigNumber(0)];
    })
    .reduce(
      (total, current) => [total[0].plus(current[0]), total[1].plus(current[1])],
      [BigNumber(0), BigNumber(0)],
    );

  if (!chartPriceStats && (currentBalance.eq(0) || oldBalance.eq(0))) return null;

  if (isHidden) {
    return (
      <RowContainer>
        <NoDataTextContainer>{EMPTY_LABEL}</NoDataTextContainer>
        {displayTimeInterval && <IntervalText>24h</IntervalText>}
      </RowContainer>
    );
  }

  const priceChangePercentage24h = chartPriceStats?.change
    ? BigNumber(chartPriceStats.change).minus(1)
    : currentBalance.dividedBy(oldBalance).minus(1);
  const formattedPercentageChange = priceChangePercentage24h
    .multipliedBy(100)
    .absoluteValue()
    .toFixed(decimals);

  const increase = priceChangePercentage24h.gte(0);
  const themeColor = increase ? Theme.colors.success_light : Theme.colors.danger_light;
  const CaretIcon = increase ? CaretUp : CaretDown;

  const formattedBalanceChange = [
    '(',
    increase ? '+' : '-',
    currencySymbolMap[fiatCurrency],
    currentBalance.minus(oldBalance).absoluteValue().toFixed(2),
    ')',
  ].join('');

  const amountChangeInUsd =
    displayAmountChange && ftCurrencyPairs.length === 1
      ? BigNumber(currentPrice)
          .multipliedBy(priceChangePercentage24h)
          .multipliedBy(exchangeRate)
          .absoluteValue()
      : null;

  const formattedAmountChange = amountChangeInUsd
    ? ['(', increase ? '+' : '-', currencySymbolMap[fiatCurrency], amountChangeInUsd, ')'].join('')
    : null;

  const renderFormattedAmountChange = () => {
    const price = BigNumber(amountChangeInUsd || 0);
    return (
      <AmountChangeText
        typography="body_medium_m"
        color={increase ? 'success_light' : 'danger_light'}
      >
        {`${increase ? '(+' : '(-'}`}
        {price.isGreaterThan(1) ? (
          `${currencySymbolMap[fiatCurrency]}${price.toFormat(2)}`
        ) : (
          <>
            {currencySymbolMap[fiatCurrency]}
            <FormattedNumber number={formatBalance(formatSignificantDecimals(price.toString()))} />
          </>
        )}
        )
      </AmountChangeText>
    );
  };

  return (
    <RowContainer>
      <CaretIcon size={12} color={themeColor} weight="fill" />
      <PercentageChangeText themeColor={themeColor}>
        {formattedPercentageChange}%
        {displayBalanceChange && formattedBalanceChange ? ` ${formattedBalanceChange}` : ''}
      </PercentageChangeText>
      {formattedAmountChange && renderFormattedAmountChange()}
      {displayTimeInterval && <IntervalText>1D</IntervalText>}
    </RowContainer>
  );
}

export default PercentageChange;
