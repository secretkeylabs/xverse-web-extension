import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import BottomBar from '@components/tabBar';
import MoonPay from '@assets/img/dashboard/moonpay.svg';
import Binance from '@assets/img/dashboard/binance.svg';
import Transak from '@assets/img/dashboard/transak.svg';
import Info from '@assets/img/info.svg';
import {
  BINANCE_MERCHANT_CODE, BINANCE_URL, MOON_PAY_API_KEY, MOON_PAY_URL, TRANSAC_API_KEY, TRANSAC_URL,
} from '@utils/constants';
import useWalletSelector from '@hooks/useWalletSelector';
import { useEffect, useState } from 'react';
import { getMoonPaySignedUrl, getBinaceSignature } from '@secretkeylabs/xverse-core/api';
import { MoonLoader } from 'react-spinners';
import RedirectButton from './redirectButton';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 22px;
  padding-right: 22px;
  padding-top: 26px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
}));

const DisclaimerContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  borderRadius: 12,
  alignItems: 'flex-start',
  backgroundColor: 'transparent',
  padding: props.theme.spacing(8),
  marginBottom: props.theme.spacing(15),
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['200'],
  marginBottom: props.theme.spacing(14),
}));

const DisclaimerAlertText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  marginBottom: props.theme.spacing(2),
}));

const DisclaimerDetailText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['200'],
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
  const { stxAddress, btcAddress, fiatCurrency } = useWalletSelector();
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
      moonPayUrl.searchParams.append('apiKey', MOON_PAY_API_KEY);
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
      transacUrl.searchParams.append('apiKey', TRANSAC_API_KEY);
      transacUrl.searchParams.append(
        'cryptoCurrencyList',
        currency!,
      );
      transacUrl.searchParams.append(
        'defaultCryptoCurrency',
        currency!,
      );
      transacUrl.searchParams.append('walletAddress', address);
      transacUrl.searchParams.append('disableWalletAddressForm', 'true');
      transacUrl.searchParams.append(
        'exchangeScreenTitle',
        `Buy ${currency}`,
      );
      setUrl(transacUrl.href);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const getBinanceUrl = async () => {
    setLoading(true);
    try {
      const binanceUrl = new URL(BINANCE_URL);
      binanceUrl.searchParams.append('cryptoAddress', address);
      binanceUrl.searchParams.append('cryptoNetwork', currency!);
      binanceUrl.searchParams.append('merchantCode', BINANCE_MERCHANT_CODE);
      binanceUrl.searchParams.append('timestamp', `${new Date().getTime()}`);
      const signature = await getBinaceSignature(
        binanceUrl.search.replace('?', ''),
      );
      binanceUrl.search = signature.signedUrl;
      binanceUrl.searchParams.append('cryptoCurrency', currency!);
      binanceUrl.searchParams.append(
        'fiatCurrency',
        currency === 'STX' ? 'EUR' : fiatCurrency,
      ); // HACK: 24th Aug 2022 - Binance only supports EUR to STX
      setUrl(binanceUrl.toString());
    } catch (e) {
      setLoading(false);
    } finally {
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
        <RedirectButton text={t('BINANCE')} src={Binance} onClick={getBinanceUrl} />
        <RedirectButton text={t('TRANSAK')} src={Transak} onClick={getTransacUrl} />
        <DisclaimerContainer>
          <img src={Info} alt="alert" />
          <ColumnContainer>
            <DisclaimerAlertText>{t('DISCLAIMER')}</DisclaimerAlertText>
            <DisclaimerDetailText>{t('THIRD_PARTY_WARNING')}</DisclaimerDetailText>
          </ColumnContainer>
        </DisclaimerContainer>
      </Container>
      <BottomBar tab="dashboard" />
    </>

  );
}

export default Buy;
