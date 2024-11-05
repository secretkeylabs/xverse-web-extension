import MoonPay from '@assets/img/dashboard/moonpay.svg';
import PayPal from '@assets/img/dashboard/paypal.svg';
import Transak from '@assets/img/dashboard/transak.svg';
import InfoContainer from '@components/infoContainer';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useHasFeature from '@hooks/useHasFeature';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { FeatureId, getMoonPaySignedUrl } from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import { MOON_PAY_API_KEY, MOON_PAY_URL, TRANSAC_API_KEY, TRANSAC_URL } from '@utils/constants';
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
  padding-top: 26px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Text = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(14),
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

function Buy() {
  const { t } = useTranslation('translation', { keyPrefix: 'BUY_SCREEN' });
  const navigate = useNavigate();
  const { currency } = useParams();
  const { stxAddress, btcAddress } = useSelectedAccount();
  const { network } = useWalletSelector();
  const address = currency === 'STX' ? stxAddress : btcAddress;
  const [loading, setLoading] = useState(false);
  const showPaypal = useHasFeature(FeatureId.PAYPAL);

  const handleBackButtonClick = () => {
    navigate('/');
  };

  const openUrl = (url) => {
    window.open(url);
  };

  const getMoonPayUrl = async (paymentMethod?: string) => {
    setLoading(true);
    try {
      const moonPayUrl = new URL(MOON_PAY_URL);
      moonPayUrl.searchParams.append('apiKey', MOON_PAY_API_KEY!);
      moonPayUrl.searchParams.append('currencyCode', currency!);
      moonPayUrl.searchParams.append('walletAddress', address);
      moonPayUrl.searchParams.append('colorCode', '#5546FF');
      if (typeof paymentMethod === 'string')
        moonPayUrl.searchParams.append('paymentMethod', paymentMethod);
      const signedUrl = await getMoonPaySignedUrl(network.type, moonPayUrl.href);
      if (signedUrl) openUrl(signedUrl.signedUrl);
    } catch (e) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getTransacUrl = () => {
    setLoading(true);
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
      <TopRow title={`${t('BUY')} ${currency}`} onClick={handleBackButtonClick} />
      <Container>
        {loading && (
          <LoaderContainer>
            <Spinner color="white" size={20} />
          </LoaderContainer>
        )}
        <Text>{t('PURCHASE_CRYPTO')}</Text>
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
        <InfoContainer titleText={t('DISCLAIMER')} bodyText={t('THIRD_PARTY_WARNING')} />
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default Buy;
