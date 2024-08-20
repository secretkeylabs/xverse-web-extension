import useCoinRates from '@hooks/queries/useCoinRates';
import {
  getBtcFiatEquivalent,
  getStxFiatEquivalent,
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
import type { Color } from 'theme';
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

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
}));

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

  const numberOfUtxoProviders = utxoProviders.length;
  const lowestUtxoQuoteFloorRate = Math.min(
    ...utxoProviders.map((provider) => Number(provider.floorRate)),
  );

  const getSubtitle = (provider: UtxoQuote): string => {
    if (numberOfUtxoProviders === 1) {
      return '';
    }
    if (Number(provider.floorRate) === lowestUtxoQuoteFloorRate) {
      return t('BEST');
    }
    const difference = lowestUtxoQuoteFloorRate
      ? Number(provider.floorRate) - lowestUtxoQuoteFloorRate
      : 0;
    const percentageDifference = (difference / lowestUtxoQuoteFloorRate) * 100;
    if (percentageDifference > 0) {
      return `+${percentageDifference.toFixed(2)}%`;
    }
    return `-${Math.abs(percentageDifference).toFixed(2)}%`;
  };

  const ammQuotes = [...ammProviders].sort((a, b) =>
    BigNumber(b.receiveAmount).gte(a.receiveAmount)
      ? 1
      : BigNumber(a.receiveAmount).gte(b.receiveAmount)
      ? -1
      : 0,
  );

  const utxoQuotes = [...utxoProviders].sort((a, b) =>
    BigNumber(b.floorRate).gte(a.floorRate) ? -1 : BigNumber(a.floorRate).gte(b.floorRate) ? 1 : 0,
  );

  return (
    <Sheet visible={visible} title={t('GET_QUOTES_TITLE')} onClose={onClose}>
      <Container>
        <StyledP typography="body_m" color="white_200">
          {t('QUOTE_TITLE')}
        </StyledP>
        {ammProviders.length > 0 ||
          (stxProviders.length > 0 && (
            <Heading typography="headline_s" color="white_0">
              {t('EXCHANGE')}
            </Heading>
          ))}
        {/* todo: get fiat rates of rune from API */}
        {ammProviders.map((amm) => (
          <QuoteTile
            key={amm.provider.name}
            provider={amm.provider.name}
            price={amm.receiveAmount}
            image={{ ft: { image: amm.provider.logo } as FungibleToken }}
            onClick={() => ammProviderClicked && ammProviderClicked(amm)}
            subtitle={t('RECOMMENDED')}
            subtitleColor="success_light"
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
        {stxProviders.map((stx) => (
          <QuoteTile
            key={stx.provider.name}
            provider={stx.provider.name}
            price={stx.receiveAmount}
            image={{ ft: { image: stx.provider.logo } as FungibleToken }}
            onClick={() => ammProviderClicked && ammProviderClicked(stx)}
            subtitle={t('RECOMMENDED')}
            subtitleColor="success_light"
            unit={stx.to.protocol === 'stx' ? 'STX' : toToken?.symbol || ''}
            fiatValue={
              stx.to.protocol === 'stx'
                ? getStxFiatEquivalent(
                    new BigNumber(stx.receiveAmount),
                    new BigNumber(stxBtcRate),
                    new BigNumber(btcFiatRate),
                  ).toFixed(2)
                : ''
            }
          />
        ))}
        {utxoQuotes.map((utxoProvider) => {
          const subTitle = getSubtitle(utxoProvider);
          let subTitleColour: Color = 'success_light';

          if (subTitle.startsWith('+')) {
            subTitleColour = 'danger_light';
          }
          return (
            <QuoteTile
              key={utxoProvider.provider.name}
              provider={utxoProvider.provider.name}
              price={utxoProvider.floorRate}
              image={{ ft: { image: utxoProvider.provider.logo } as FungibleToken }}
              floorText={t('FLOOR_PRICE')}
              onClick={() => utxoProviderClicked && utxoProviderClicked(utxoProvider)}
              subtitle={subTitle}
              subtitleColor={subTitleColour}
              unit={toToken?.symbol ? `Sats / ${toToken.symbol}` : ''}
            />
          );
        })}
      </Container>
    </Sheet>
  );
}

export default QuotesModal;
