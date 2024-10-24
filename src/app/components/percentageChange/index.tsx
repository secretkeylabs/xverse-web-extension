import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import {
  currencySymbolMap,
  getFiatEquivalent,
  type FungibleToken,
} from '@secretkeylabs/xverse-core';
import type { CurrencyTypes } from '@utils/constants';
import { getBalanceAmount } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import Theme from 'theme';

const NoDataTextContainer = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_600,
  marginRight: props.theme.space.xxs,
}));

function NoDataText() {
  return <NoDataTextContainer>--</NoDataTextContainer>;
}

const RowContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: props.theme.space.xxs,
}));

interface PercentageChangeTextProps {
  themeColor: string;
}

const PercentageChangeText = styled.p<PercentageChangeTextProps>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.themeColor,
  marginLeft: props.theme.space.xxxs,
}));

const IntervalText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  marginLeft: props.theme.space.xs,
}));

type Props = {
  ftCurrencyPairs: [FungibleToken, CurrencyTypes][];
  decimals?: number;
  displayTimeInterval?: boolean;
  displayBalanceChange?: boolean;
  displayAmountChange?: boolean;
};

function PercentageChange({
  ftCurrencyPairs,
  decimals = 2,
  displayTimeInterval = false,
  displayBalanceChange = false,
  displayAmountChange = false,
}: Props) {
  const { fiatCurrency } = useWalletSelector();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const { data: stxData } = useStxWalletData();
  const { data: btcBalance } = useBtcWalletData();

  const [currentBalance, oldBalance] = ftCurrencyPairs
    .map(([fungibleToken, currency]) => {
      if (!fungibleToken.priceChangePercentage24h || !fungibleToken.tokenFiatRate || !currency) {
        return [BigNumber(0), BigNumber(0)];
      }

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

      const priceChangePercentage24h = 100.0 + parseFloat(fungibleToken.priceChangePercentage24h);
      return [
        BigNumber(fiatBalance),
        BigNumber(fiatBalance).dividedBy(priceChangePercentage24h).multipliedBy(100),
      ];
    })
    .reduce(
      (total, current) => [total[0].plus(current[0]), total[1].plus(current[1])],
      [BigNumber(0), BigNumber(0)],
    );

  if (currentBalance.eq(0) || oldBalance.eq(0)) {
    return <NoDataText />;
  }

  const priceChangePercentage24h = currentBalance.dividedBy(oldBalance).minus(1);
  const formattedPercentageChange = priceChangePercentage24h
    .multipliedBy(100)
    .absoluteValue()
    .toFixed(decimals);

  const increase = priceChangePercentage24h.gte(0);
  const themeColor = increase ? Theme.colors.success_light : Theme.colors.danger_light;
  const CaretIcon = increase ? CaretUp : CaretDown;

  const formattedBalanceChange = [
    '(',
    currencySymbolMap[fiatCurrency],
    increase ? '+' : '-',
    currentBalance.minus(oldBalance).absoluteValue().toFixed(2),
    ')',
  ].join('');

  // chm todo: multiple by selected currency
  const amountChangeInUsd =
    displayAmountChange && ftCurrencyPairs.length === 1 && ftCurrencyPairs[0][0].currentPrice
      ? BigNumber(ftCurrencyPairs[0][0].currentPrice)
          .multipliedBy(priceChangePercentage24h)
          .absoluteValue()
          .toFixed(2)
      : null;

  const formattedAmountChange = amountChangeInUsd
    ? ['(', currencySymbolMap[fiatCurrency], increase ? '+' : '-', amountChangeInUsd, ')'].join('')
    : null;

  return (
    <RowContainer>
      <CaretIcon size={12} color={themeColor} weight="fill" />
      <PercentageChangeText themeColor={themeColor}>
        {formattedPercentageChange}%
        {displayBalanceChange && formattedBalanceChange ? ` ${formattedBalanceChange}` : ''}
        {formattedAmountChange ? ` ${formattedAmountChange}` : ''}
      </PercentageChangeText>
      {displayTimeInterval && <IntervalText>24h</IntervalText>}
    </RowContainer>
  );
}

export default PercentageChange;
