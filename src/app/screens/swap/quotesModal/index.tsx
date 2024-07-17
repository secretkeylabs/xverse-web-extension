import useCoinRates from '@hooks/queries/useCoinRates';
import { getBtcFiatEquivalent, type Quote, type UtxoQuote } from '@secretkeylabs/xverse-core';
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
  ammProviderClicked,
  utxoProviderClicked,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });

  const { btcFiatRate } = useCoinRates();

  const numberOfUtxoProviders = utxoProviders.length;
  const highestFloorRate = Math.max(...utxoProviders.map((provider) => Number(provider.floorRate)));

  const getSubtitle = (provider: UtxoQuote, highestRate: number): string => {
    if (numberOfUtxoProviders === 1) {
      return '';
    }
    if (Number(provider.floorRate) === highestRate) {
      return t('BEST');
    }
    const difference = highestRate ? Number(provider.floorRate) - highestRate : 0;
    const percentageDifference = (difference / highestRate) * 100;
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
        {/* todo: pass rune symbol as unit , it should be passed from swaps screen */}
        {/* get fiat rates of rune after API returns runeID */}
        {ammProviders.map((amm) => (
          <QuoteTile
            key={amm.provider.name}
            provider={amm.provider.name}
            price={amm.receiveAmount}
            image={amm.provider.logo}
            onClick={() => ammProviderClicked && ammProviderClicked(amm)}
            subtitle={t('RECOMMENDED')}
            unit={amm.to.protocol === 'btc' ? 'sats' : amm.to.protocol}
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
        {utxoProviders.map((utxoProvider) => (
          <QuoteTile
            key={utxoProvider.provider.name}
            provider={utxoProvider.provider.name}
            price={utxoProvider.floorRate}
            image={utxoProvider.provider.logo}
            floorText={t('FLOOR_PRICE')}
            onClick={() => utxoProviderClicked && utxoProviderClicked(utxoProvider)}
            subtitle={getSubtitle(utxoProvider, highestFloorRate)}
            unit="Sats/rune"
          />
        ))}
      </Container>
    </Sheet>
  );
}

export default QuotesModal;
