import PercentageChange from '@components/percentageChange';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import { currencySymbolMap, type FungibleToken } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import type { CurrencyTypes } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.space.l};
  margin-left: ${({ theme }) => theme.space.m};
`;

type Props = {
  currency: CurrencyTypes;
  fungibleToken: FungibleToken;
};

function TokenPrice({ currency, fungibleToken }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const { stxBtcRate, btcUsdRate } = useSupportedCoinRates();

  const currentPrice = useMemo(() => {
    switch (currency) {
      case 'STX':
        return BigNumber(stxBtcRate).multipliedBy(btcUsdRate);
      case 'BTC':
        return BigNumber(btcUsdRate);
      default:
        return BigNumber(fungibleToken?.currentPrice ?? 0);
    }
  }, [currency, stxBtcRate, btcUsdRate, fungibleToken]);

  const formattedPrice = currentPrice.toFixed(2);

  return (
    <Container>
      <StyledP typography="body_medium_m" color="white_200">
        {currency === 'STX' || currency === 'BTC' ? currency : fungibleToken.name} {t('PRICE')}
      </StyledP>
      <NumericFormat
        value={formattedPrice}
        displayType="text"
        thousandSeparator
        prefix={`${currencySymbolMap.USD}`}
        suffix=" USD"
        renderText={(value) => (
          <StyledP typography="headline_l" color="white_0">
            {value}
          </StyledP>
        )}
      />
      <PercentageChange ftCurrencyPairs={[[fungibleToken, currency]]} displayAmountChange />
    </Container>
  );
}

export default TokenPrice;
