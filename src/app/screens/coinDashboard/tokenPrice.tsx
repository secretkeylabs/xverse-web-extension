import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import FormattedNumber from '@components/formattedNumber';
import PercentageChange from '@components/percentageChange';
import useGetCoinStatsAndInfoQuery from '@hooks/queries/runes/useGetCoinStatsAndInfoQuery';
import useGetExchangeRate from '@hooks/queries/useGetExchangeRate';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { btcFt, stxFt } from '@screens/swap/useMasterCoinsList';
import { currencySymbolMap, formatBalance, type FungibleToken } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import type { CurrencyTypes } from '@utils/constants';
import { formatSignificantDecimals } from '@utils/tokens';
import { NumericFormat } from 'react-number-format';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.space.l};
  padding: 0 ${({ theme }) => theme.space.m};
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space.m};
  flex: 1;
`;

const StatColumn = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.space.m};
  gap: ${({ theme }) => theme.space.xxxs};
  min-width: 0;
`;

const StatValue = styled(StyledP)`
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  white-space: normal;
  width: 100%;
`;

const InfoContainer = styled.div`
  margin-top: ${({ theme }) => theme.space.l};
  display: flex;
  flex-direction: column;
`;

type Props = {
  currency: CurrencyTypes;
  fungibleToken: FungibleToken | undefined;
};

export type ChartPriceStats = {
  amount?: number;
  change?: number;
};

interface StatProps {
  label: string;
  value?: React.ReactNode | string | null;
  additionalContent?: React.ReactNode;
}

const PLACE_HOLDER = '--';

function Stat({ label, value, additionalContent }: StatProps) {
  return (
    <StatColumn>
      <StyledP typography="body_medium_m" color="white_400">
        {label}
      </StyledP>
      <StatValue typography="body_medium_m" color="white_0">
        {value ?? PLACE_HOLDER}
      </StatValue>
      {additionalContent}
    </StatColumn>
  );
}

function FormattedCurrencyValue({ value, currency }: { value: BigNumber; currency: string }) {
  if (value.isGreaterThan(1)) {
    return `${currency === '' ? '' : currencySymbolMap[currency]}${value.toFormat(2)} ${currency}`;
  }
  return (
    <>
      {currency === '' ? '' : currencySymbolMap[currency]}
      <FormattedNumber number={formatBalance(formatSignificantDecimals(value.toFixed(12)))} />
    </>
  );
}

function TokenPrice({ currency, fungibleToken }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const { fiatCurrency } = useWalletSelector();
  const { data: exchangeRates } = useGetExchangeRate('USD');
  const { stxBtcRate, btcUsdRate } = useSupportedCoinRates();
  const { data: tokenStatsAndInfo } = useGetCoinStatsAndInfoQuery(
    fungibleToken?.principal,
    fungibleToken?.protocol,
  );

  const { volume24h, marketCap, holders, divisibility, mintable, mintLimit } =
    tokenStatsAndInfo ?? {};

  const exchangeRate = useMemo(
    () => (exchangeRates ? Number(exchangeRates[fiatCurrency]) : 1),
    [exchangeRates, fiatCurrency],
  );

  const basePrice = useMemo(() => {
    const baseRate = BigNumber(exchangeRate);
    if (currency === 'STX') return baseRate.multipliedBy(stxBtcRate).multipliedBy(btcUsdRate);
    if (currency === 'BTC') return baseRate.multipliedBy(btcUsdRate);
    return baseRate.multipliedBy(fungibleToken?.currentPrice ?? 0);
  }, [currency, stxBtcRate, btcUsdRate, fungibleToken, exchangeRate]);

  const currentPrice = basePrice;

  const tokenName =
    currency === 'BTC' ? btcFt.name : currency === 'STX' ? stxFt.name : fungibleToken?.name;
  const tokenSymbol =
    currency === 'BTC' || currency === 'STX'
      ? currency
      : fungibleToken?.protocol === 'runes'
      ? fungibleToken?.runeSymbol
      : fungibleToken?.ticker;
  const tokenDivisibility =
    currency === 'BTC' ? btcFt.decimals : currency === 'STX' ? stxFt.decimals : divisibility;

  return (
    <Container>
      <StyledP typography="body_medium_m" color="white_200">
        {t('STATS')}
      </StyledP>
      <StatsContainer>
        <Stat
          label={t('CURRENT_PRICE')}
          value={<FormattedCurrencyValue value={currentPrice} currency={fiatCurrency} />}
          additionalContent={
            <PercentageChange ftCurrencyPairs={[[fungibleToken, currency]]} displayAmountChange />
          }
        />
        <Stat
          label={t('VOLUME_24H')}
          value={
            volume24h && (
              <FormattedCurrencyValue
                value={BigNumber(volume24h.toString())}
                currency={fiatCurrency}
              />
            )
          }
        />
      </StatsContainer>
      <StatsContainer>
        <Stat
          label={t('MARKET_CAP')}
          value={
            marketCap && (
              <FormattedCurrencyValue
                value={BigNumber(marketCap.toString())}
                currency={fiatCurrency}
              />
            )
          }
        />
        <Stat
          label={t('HOLDERS')}
          value={
            holders && (
              <NumericFormat
                value={holders}
                displayType="text"
                thousandSeparator
                renderText={(value: string) => (
                  <StyledP typography="body_medium_m" color="white_0">
                    {value}
                  </StyledP>
                )}
              />
            )
          }
        />
      </StatsContainer>

      <InfoContainer>
        <StyledP typography="body_medium_m" color="white_200">
          {t('INFO')}
        </StyledP>
        <StatsContainer>
          <Stat label={t('NAME')} value={tokenName} />
          <Stat label={t('TICKER')} value={tokenSymbol} />
        </StatsContainer>
        <StatsContainer>
          <Stat label={t('DIVISIBILITY')} value={tokenDivisibility} />
          {fungibleToken && fungibleToken.protocol !== 'stacks' && (
            <Stat
              label={t('MINTABLE')}
              value={mintable === undefined ? null : mintable ? 'Yes' : 'No'}
            />
          )}
        </StatsContainer>
        <StatsContainer>
          {mintable && fungibleToken && fungibleToken.protocol !== 'stacks' && (
            <Stat
              label={t('MINT_LIMIT')}
              value={
                mintLimit && (
                  <FormattedNumber
                    number={formatBalance(formatSignificantDecimals(mintLimit.toString()))}
                  />
                )
              }
            />
          )}
        </StatsContainer>
      </InfoContainer>
    </Container>
  );
}

export default TokenPrice;
