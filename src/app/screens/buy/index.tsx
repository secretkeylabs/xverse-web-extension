import MoonPay from '@assets/img/dashboard/moonpay.svg';
import PayPal from '@assets/img/dashboard/paypal.svg';
import Transak from '@assets/img/dashboard/transak.svg';
import XverseSwaps from '@assets/img/dashboard/xverse_swaps_logo.svg';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useXverseApi from '@hooks/apiClients/useXverseApi';
import useHasFeature from '@hooks/useHasFeature';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { AnalyticsEvents, FeatureId } from '@secretkeylabs/xverse-core';
import Callout from '@ui-library/callout';
import Spinner from '@ui-library/spinner';
import { MOON_PAY_API_KEY, MOON_PAY_URL, TRANSAC_API_KEY, TRANSAC_URL } from '@utils/constants';
import { trackMixPanel } from '@utils/mixpanel';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import RedirectButton from './redirectButton';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-left: 22px;
  padding-right: 22px;
  padding-top: ${({ theme }) => theme.space.xs};
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  margin-bottom: 22px;
`;

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  color: props.theme.colors.white_0,
}));

const Text = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.l,
}));

const LoaderContainer = styled.div({
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed',
  zIndex: 10,
  background: 'rgba(25, 25, 48, 0.5)',
  backdropFilter: 'blur(2px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const InfoMessageContainer = styled.div((props) => ({
  marginTop: props.theme.space.xxs,
}));

function Buy() {
  const { t } = useTranslation('translation', { keyPrefix: 'BUY_SCREEN' });
  const navigate = useNavigate();
  const { currency } = useParams();
  const { stxAddress, btcAddress } = useSelectedAccount();
  const { network, hasBackedUpWallet } = useWalletSelector();
  const address = currency === 'STX' ? stxAddress : btcAddress;
  const [loading, setLoading] = useState(false);
  const showPaypal = useHasFeature(FeatureId.PAYPAL);
  const xverseApiClient = useXverseApi();

  const handleBackButtonClick = () => {
    navigate('/');
  };

  const openUrl = (url) => {
    window.open(url);
  };

  const getMoonPayUrl = async (paymentMethod?: string) => {
    setLoading(true);
    trackMixPanel(AnalyticsEvents.SelectBuyProvider, {
      provider: paymentMethod === 'paypal' ? 'paypal' : 'moonpay',
    });
    try {
      const moonPayUrl = new URL(MOON_PAY_URL);
      moonPayUrl.searchParams.append('apiKey', MOON_PAY_API_KEY!);
      moonPayUrl.searchParams.append('currencyCode', currency!);
      moonPayUrl.searchParams.append('walletAddress', address);
      moonPayUrl.searchParams.append('colorCode', '#5546FF');
      if (typeof paymentMethod === 'string')
        moonPayUrl.searchParams.append('paymentMethod', paymentMethod);
      const signedUrl = await xverseApiClient.getMoonPaySignedUrl(moonPayUrl.href);
      if (signedUrl) openUrl(signedUrl.signedUrl);
    } catch (e) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getTransacUrl = () => {
    setLoading(true);
    trackMixPanel(AnalyticsEvents.SelectBuyProvider, {
      provider: 'transak',
    });
    try {
      const transacUrl = new URL(TRANSAC_URL);
      transacUrl.searchParams.append('apiKey', TRANSAC_API_KEY!);
      transacUrl.searchParams.append('cryptoCurrencyList', currency!);
      transacUrl.searchParams.append('defaultCryptoCurrency', currency!);
      transacUrl.searchParams.append('walletAddress', address);
      transacUrl.searchParams.append('disableWalletAddressForm', 'true');
      transacUrl.searchParams.append('exchangeScreenTitle', `Buy ${currency}`);
      openUrl(transacUrl.href);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <>
      <TopRow backupReminder={!hasBackedUpWallet} onClick={handleBackButtonClick} />
      <Container>
        {loading && (
          <LoaderContainer>
            <Spinner color="white" size={20} />
          </LoaderContainer>
        )}
        <Title>{`${t('BUY')} ${currency}`}</Title>
        <Text>{t('PURCHASE_CRYPTO')}</Text>
        {currency === 'BTC' && (
          <RedirectButton
            text={t('XVERSE_SWAPS')}
            subText={t('XVERSE_SWAPS_DESC')}
            src={XverseSwaps}
            onClick={() => {
              trackMixPanel(AnalyticsEvents.SelectBuyProvider, {
                provider: 'xverse_swaps',
              });
              openUrl('https://wallet.xverse.app/swaps');
            }}
          />
        )}
        <RedirectButton text={t('MOONPAY')} src={MoonPay} onClick={getMoonPayUrl} />
        <RedirectButton text={t('TRANSAK')} src={Transak} onClick={getTransacUrl} />
        {showPaypal && (
          <RedirectButton
            text={t('PAYPAL')}
            subText={t('US_UK_EU_ONLY')}
            src={PayPal}
            onClick={() => getMoonPayUrl('paypal')}
          />
        )}
        <InfoMessageContainer>
          <Callout titleText={t('DISCLAIMER')} bodyText={t('THIRD_PARTY_WARNING')} />
        </InfoMessageContainer>
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default Buy;
