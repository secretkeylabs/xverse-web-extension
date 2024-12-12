import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import FormattedNumber from '@components/formattedNumber';
import PercentageChange from '@components/percentageChange';
import useGetExchangeRate from '@hooks/queries/useGetExchangeRate';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { currencySymbolMap, formatBalance, type FungibleToken } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import type { CurrencyTypes } from '@utils/constants';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.space.l};
  margin-left: ${({ theme }) => theme.space.m};
`;

type Props = {
  currency: CurrencyTypes;
  fungibleToken: FungibleToken | undefined;
};

// todo: move into xverse-core
function formatSignificantDecimals(input: string) {
  return input.replace(/(\.\d*?[1-9](?:[^0]*?[1-9]){0,3}).*/, '$1');
}

function TokenPrice({ currency, fungibleToken }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const { fiatCurrency } = useWalletSelector();
  const { data: exchangeRates } = useGetExchangeRate('USD');
  const { stxBtcRate, btcUsdRate } = useSupportedCoinRates();

  const exchangeRate = useMemo(
    () => (exchangeRates ? Number(exchangeRates[fiatCurrency]) : 1),
    [exchangeRates, fiatCurrency],
  );

  const currentPrice = useMemo(() => {
    const baseRate = BigNumber(exchangeRate);
    if (currency === 'STX') return baseRate.multipliedBy(stxBtcRate).multipliedBy(btcUsdRate);
    if (currency === 'BTC') return baseRate.multipliedBy(btcUsdRate);
    return baseRate.multipliedBy(fungibleToken?.currentPrice ?? 0);
  }, [currency, stxBtcRate, btcUsdRate, fungibleToken, exchangeRate]);

  return (
    <Container>
      <StyledP typography="body_medium_m" color="white_200">
        {currency === 'STX' || currency === 'BTC' ? currency : fungibleToken?.name} {t('PRICE')}
      </StyledP>
      <StyledP typography="headline_l" color="white_0">
        {currentPrice.isGreaterThan(1) ? (
          `${currencySymbolMap[fiatCurrency]}${currentPrice.toFormat(2)} ${fiatCurrency}`
        ) : (
          <>
            {currencySymbolMap[fiatCurrency]}
            <FormattedNumber
              number={formatBalance(formatSignificantDecimals(currentPrice.toString()))}
              tokenSymbol={fiatCurrency}
            />
          </>
        )}
      </StyledP>
      <PercentageChange ftCurrencyPairs={[[fungibleToken, currency]]} displayAmountChange />
      {/* <TokenHistoricalData currency={currency} fungibleToken={fungibleToken} /> */}
    </Container>
  );
}

export default TokenPrice;
