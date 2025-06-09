import useGetSip10TokenInfo from '@hooks/queries/stx/useGetSip10TokenInfo';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import {
  btcToSats,
  getBtcFiatEquivalent,
  getStxFiatEquivalent,
  stxToMicrostacks,
  type FungibleToken,
  type Quote,
  type StxQuote,
  type UtxoQuote,
} from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { getProviderDetails } from '../utils';
import QuoteTile from './quoteTile';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Heading = styled(StyledP)`
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

const Title = styled(StyledP)`
  margin-bottom: ${(props) => props.theme.space.l};
`;

const Disclaimer = styled(StyledP)`
  margin-bottom: ${(props) => props.theme.space.s};
`;

type Props = {
  visible: boolean;
  onClose: () => void;
  ammProviders: Quote[];
  utxoProviders: UtxoQuote[];
  stxProviders: StxQuote[];
  toToken?: FungibleToken;
  ammProviderClicked?: (amm: Quote) => void;
  utxoProviderClicked?: (utxoProvider: UtxoQuote) => void;
  toRuneFiatRate?: number;
  amount?: string;
};

function QuotesModal({
  visible,
  onClose,
  ammProviders,
  utxoProviders,
  stxProviders,
  toToken,
  ammProviderClicked,
  utxoProviderClicked,
  toRuneFiatRate,
  amount,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });

  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const { tokenInfo: toTokenInfo } = useGetSip10TokenInfo({ principal: toToken?.principal });

  const sortQuotesByReceiveAmount = <T extends StxQuote | Quote>(quotes: T[]): T[] =>
    [...quotes].sort((a, b) => BigNumber(b.receiveAmount).comparedTo(a.receiveAmount) ?? 1);

  const sortQuotesByFloorPrice = <T extends UtxoQuote>(quotes: T[]): T[] =>
    [...quotes].sort((a, b) => BigNumber(a.floorRate).comparedTo(b.floorRate) ?? 1);

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
        <Title typography="body_m" color="white_200">
          {t('QUOTE_TITLE')}
        </Title>

        {sortedAmmQuotes.map((amm) => {
          const { name: providerName, logo: providerLogo } = getProviderDetails(amm);
          return (
            <QuoteTile
              key={providerName}
              provider={providerName}
              price={amm.receiveAmount}
              image={providerLogo}
              onClick={() => ammProviderClicked && ammProviderClicked(amm)}
              subtitle={getReceiveAmountSubtitle(amm, ammProviders)}
              unit={amm.to.protocol === 'btc' ? 'Sats' : `${toToken?.runeSymbol ?? ''}`}
              fiatValue={
                amm.to.protocol === 'btc'
                  ? getBtcFiatEquivalent(
                      new BigNumber(amm.receiveAmount),
                      new BigNumber(btcFiatRate),
                    ).toFixed(2)
                  : toRuneFiatRate
                  ? new BigNumber(toRuneFiatRate).multipliedBy(amm.receiveAmount).toFixed(2)
                  : undefined
              }
            />
          );
        })}

        {sortedStxQuotes.map((stx) => (
          <QuoteTile
            key={stx.provider.name}
            provider={stx.provider.name}
            price={stx.receiveAmount}
            image={stx.provider.logo}
            onClick={() => ammProviderClicked?.(stx)}
            subtitle={getReceiveAmountSubtitle(stx, stxProviders)}
            unit={stx.to.protocol === 'stx' ? 'STX' : toToken?.ticker || ''}
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
        {sortedUtxoQuotes.length > 0 && (
          <>
            <Disclaimer typography="body_m" color="white_200">
              {t('UTXO_PROVIDER_DISCLAIMER')}
            </Disclaimer>
            {sortedUtxoQuotes.map((utxoProvider) => (
              <QuoteTile
                key={utxoProvider.provider.name}
                provider={utxoProvider.provider.name}
                price={
                  amount
                    ? btcToSats(BigNumber(amount)).dividedBy(utxoProvider.floorRate).toString()
                    : utxoProvider.floorRate
                }
                image={utxoProvider.provider.logo}
                fiatValue={
                  toRuneFiatRate && amount
                    ? new BigNumber(toRuneFiatRate)
                        .multipliedBy(
                          btcToSats(BigNumber(amount)).dividedBy(utxoProvider.floorRate),
                        )
                        .toFixed(2)
                    : undefined
                }
                onClick={() => utxoProviderClicked && utxoProviderClicked(utxoProvider)}
                subtitle={getFloorPriceSubtitle(utxoProvider, utxoProviders)}
                unit={toToken?.runeSymbol ?? ''}
              />
            ))}
          </>
        )}
      </Container>
    </Sheet>
  );
}

export default QuotesModal;
