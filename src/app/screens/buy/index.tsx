import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import BottomBar from '@components/tabBar';
import MoonPay from '@assets/img/dashboard/moonpay.svg';
import Transak from '@assets/img/dashboard/transak.svg';
import { MOON_PAY_API_KEY, MOON_PAY_URL, TRANSAC_API_KEY, TRANSAC_URL } from '@utils/constants';
import useWalletSelector from '@hooks/useWalletSelector';
import { useEffect, useState } from 'react';
import { getMoonPaySignedUrl } from '@secretkeylabs/xverse-core/api';
import { MoonLoader } from 'react-spinners';
import InfoContainer from '@components/infoContainer';
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
  const { stxAddress, btcAddress } = useWalletSelector();
  const address = currency === 'STX' ? stxAddress : btcAddress;
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleBackButtonClick = () => {
    navigate('/');
  };

  useEffect(() => {
    if (url !== '') {
      window.open(url);
    }
  }, [url]);

  const getMoonPayUrl = async () => {
    setLoading(true);
    try {
      const moonPayUrl = new URL(MOON_PAY_URL);
      moonPayUrl.searchParams.append('apiKey', MOON_PAY_API_KEY!);
      moonPayUrl.searchParams.append('currencyCode', currency!);
      moonPayUrl.searchParams.append('walletAddress', address);
      moonPayUrl.searchParams.append('colorCode', '#5546FF');
      const signedUrl = await getMoonPaySignedUrl(moonPayUrl.href);
      setUrl(signedUrl?.signedUrl ?? '');
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
      setUrl(transacUrl.href);
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
            <MoonLoader color="white" size={20} />
          </LoaderContainer>
        )}
        <Text>{t('PURCHASE_CRYPTO')}</Text>
        <RedirectButton text={t('MOONPAY')} src={MoonPay} onClick={getMoonPayUrl} />
        <RedirectButton text={t('TRANSAK')} src={Transak} onClick={getTransacUrl} />
        <InfoContainer titleText={t('DISCLAIMER')} bodyText={t('THIRD_PARTY_WARNING')} />
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default Buy;
