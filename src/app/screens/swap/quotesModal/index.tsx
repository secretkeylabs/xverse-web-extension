import useGetSip10TokenInfo from '@hooks/queries/stx/useGetSip10TokenInfo';
import useCoinRates from '@hooks/queries/useCoinRates';
import {
  getBtcFiatEquivalent,
  getStxFiatEquivalent,
  stxToMicrostacks,
  type FungibleToken,
  type Quote,
  type StxQuote,
  type Token,
  type UtxoQuote,
} from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import QuoteTile from './quoteTile';

interface Props {
  visible: boolean;
  onClose: () => void;
  ammProviders: Quote[];
  utxoProviders: UtxoQuote[];
  stxProviders: StxQuote[];
  toToken?: Token;
  ammProviderClicked?: (amm: Quote) => void;
  utxoProviderClicked?: (utxoProvider: UtxoQuote) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Heading = styled(StyledP)`
  margin-top: ${(props) => props.theme.space.l};
  margin-bottom: ${(props) => props.theme.space.xxs};
  font-size: ${(props) => props.theme.space.s};
  font-weight: 700;
  line-height: 125%;
  letter-spacing: 0.22px;
  text-transform: uppercase;
`;

const SecondHeading = styled(StyledP)`
  margin-top: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.xxs};
  font-size: ${(props) => props.theme.space.s};
  font-weight: 700;
  line-height: 125%;
  letter-spacing: 0.22px;
  text-transform: uppercase;
`;

function QuotesModal({
  visible,
  onClose,
  ammProviders,
  utxoProviders,
  stxProviders,
  toToken,
  ammProviderClicked,
  utxoProviderClicked,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });

  const { btcFiatRate, stxBtcRate } = useCoinRates();
  const { tokenInfo: toTokenInfo } = useGetSip10TokenInfo({ principal: toToken?.ticker });

  const sortQuotesByReceiveAmount = <T extends StxQuote | Quote>(quotes: T[]): T[] =>
    [...quotes].sort((a, b) => BigNumber(b.receiveAmount).comparedTo(a.receiveAmount));

  const sortQuotesByFloorPrice = <T extends UtxoQuote>(quotes: T[]): T[] =>
    [...quotes].sort((a, b) => BigNumber(a.floorRate).comparedTo(b.floorRate));

  const sortedAmmQuotes = sortQuotesByReceiveAmount<Quote>(ammProviders);
  const sortedStxQuotes = sortQuotesByReceiveAmount<StxQuote>(stxProviders);
  const sortedUtxoQuotes = sortQuotesByFloorPrice<UtxoQuote>(utxoProviders);

  const getReceiveAmountSubtitle = (
    quote: StxQuote | Quote,
    quotes: (StxQuote | Quote)[],
  ): string => {
    const highestReceiveAmount = BigNumber.max(
      ...quotes.map((q) => new BigNumber(q.receiveAmount)),
    );

    if (quote.provider.code === 'dotswap') {
      return t('RECOMMENDED');
    }

    if (new BigNumber(quote.receiveAmount).eq(highestReceiveAmount)) {
      return t('BEST');
    }

    const difference = highestReceiveAmount.minus(quote.receiveAmount);
    const percentageDifference = difference.div(highestReceiveAmount).times(100);

    if (percentageDifference.gt(0)) {
      return `+${percentageDifference.toFixed(2)}%`;
    }

    return `-${percentageDifference.abs().toFixed(2)}%`;
  };

  const getFloorPriceSubtitle = (quote: UtxoQuote, quotes: UtxoQuote[]): string => {
    if (quotes.length === 1) {
      return '';
    }

    const lowestUtxoQuoteFloorRate = Math.min(
      ...utxoProviders.map((provider) => Number(provider.floorRate)),
    );

    if (Number(quote.floorRate) === lowestUtxoQuoteFloorRate) {
      return t('BEST');
    }
    const difference = lowestUtxoQuoteFloorRate
      ? Number(quote.floorRate) - lowestUtxoQuoteFloorRate
      : 0;
    const percentageDifference = (difference / lowestUtxoQuoteFloorRate) * 100;
    if (percentageDifference > 0) {
      return `+${percentageDifference.toFixed(2)}%`;
    }
    return `-${Math.abs(percentageDifference).toFixed(2)}%`;
  };

  return (
    <Sheet visible={visible} title={t('GET_QUOTES_TITLE')} onClose={onClose}>
      <Container>
        <StyledP typography="body_m" color="white_200">
          {t('QUOTE_TITLE')}
        </StyledP>
        {ammProviders.length > 0 && (
          <Heading typography="headline_s" color="white_0">
            {t('EXCHANGE')}
          </Heading>
        )}
        {sortedAmmQuotes.map((amm) => (
          <QuoteTile
            key={amm.provider.name}
            provider={amm.provider.name}
            price={amm.receiveAmount}
            image={{ ft: { image: amm.provider.logo } as FungibleToken }}
            onClick={() => ammProviderClicked && ammProviderClicked(amm)}
            subtitle={getReceiveAmountSubtitle(amm, ammProviders)}
            unit={amm.to.protocol === 'btc' ? 'Sats' : toToken?.symbol || ''}
            fiatValue={
              amm.to.protocol === 'btc'
                ? getBtcFiatEquivalent(
                    new BigNumber(amm.receiveAmount),
                    new BigNumber(btcFiatRate),
                  ).toFixed(2)
                : ''
            }
          />
        ))}
        {utxoProviders.length > 0 && (
          <SecondHeading typography="headline_s" color="white_0">
            {t('MARKETPLACE')}
          </SecondHeading>
        )}
        {sortedStxQuotes.map((stx) => (
          <QuoteTile
            key={stx.provider.name}
            provider={stx.provider.name}
            price={stx.receiveAmount}
            image={{ ft: { image: stx.provider.logo } as FungibleToken }}
            onClick={() => ammProviderClicked && ammProviderClicked(stx)}
            subtitle={getReceiveAmountSubtitle(stx, stxProviders)}
            unit={stx.to.protocol === 'stx' ? 'STX' : toToken?.name || ''}
            fiatValue={
              stx.to.protocol === 'stx'
                ? getStxFiatEquivalent(
                    stxToMicrostacks(new BigNumber(stx.receiveAmount)),
                    new BigNumber(stxBtcRate),
                    new BigNumber(btcFiatRate),
                  ).toFixed(2)
                : toTokenInfo?.tokenFiatRate
                ? new BigNumber(toTokenInfo?.tokenFiatRate)
                    .multipliedBy(stx.receiveAmount)
                    .toFixed(2)
                : '--'
            }
          />
        ))}
        {sortedUtxoQuotes.map((utxoProvider) => (
          <QuoteTile
            key={utxoProvider.provider.name}
            provider={utxoProvider.provider.name}
            price={utxoProvider.floorRate}
            image={{ ft: { image: utxoProvider.provider.logo } as FungibleToken }}
            floorText={t('FLOOR_PRICE')}
            onClick={() => utxoProviderClicked && utxoProviderClicked(utxoProvider)}
            subtitle={getFloorPriceSubtitle(utxoProvider, utxoProviders)}
            unit={toToken?.symbol ? `Sats / ${toToken.symbol}` : ''}
          />
        ))}
      </Container>
    </Sheet>
  );
}

export default QuotesModal;
