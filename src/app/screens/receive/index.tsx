import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import TopRow from '@components/topRow';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import Copy from '@assets/img/dashboard/Copy.svg';
import { useState } from 'react';
import ActionButton from '@components/button';
import Theme from 'theme';
import useWalletSelector from '@hooks/useWalletSelector';

const TopTitleText = styled.h1((props) => ({
  ...props.theme.headline_s,
  textAlign: 'center',
  marginBottom: props.theme.spacing(4),
}));

const ReceiveScreenText = styled.h1((props) => ({
  ...props.theme.body_m,
  textAlign: 'center',
  color: props.theme.colors.white['200'],
}));

const BnsNameText = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  textAlign: 'center',
}));

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: props.theme.spacing(8),
}));

const InfoContainer = styled.div((props) => ({
  width: 220,
  marginTop: props.theme.spacing(8),
}));

const CopyContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginTop: props.theme.spacing(11),
}));

const QRCodeContainer = styled.div((props) => ({
  maxWidth: 200,
  width: '60%',
  display: 'flex',
  aspectRatio: 1,
  backgroundColor: props.theme.colors.white['0'],
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  padding: props.theme.spacing(5),
  marginTop: props.theme.spacing(15),
  marginBottom: props.theme.spacing(12),
}));

const AddressText = styled.h1((props) => ({
  ...props.theme.body_m,
  textAlign: 'center',
  color: props.theme.colors.white['200'],
  wordBreak: 'break-all',
}));

function Receive(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'RECEIVE' });
  const [addressCopied, setAddressCopied] = useState(false);
  const navigate = useNavigate();
  const {
    stxAddress,
    btcAddress,
    selectedAccount,
  } = useWalletSelector();

  const { currency } = useParams();

  const getAddress = () => {
    switch (currency) {
      case 'STX':
        return stxAddress;
      case 'BTC':
        return btcAddress;
      case 'FT':
        return stxAddress;
      default:
        return '';
    }
  };
  const handleBackButtonClick = () => {
    navigate('/');
  };

  const renderHeading = () => (currency === 'BTC' ? (
    <TopTitleText>
      {t('BTC_ADDRESS')}
    </TopTitleText>
  ) : (
    <TopTitleText>{t('STX_ADDRESS')}</TopTitleText>
  ));

  const handleOnClick = () => {
    navigator.clipboard.writeText(getAddress());
    setAddressCopied(true);
  };
  return (
    <>
      <TopRow title={t('RECEIVE')} onClick={handleBackButtonClick} />
      <Container>
        {renderHeading()}
        {currency !== 'BTC' && <ReceiveScreenText>{t('STX_ADDRESS_DESC')}</ReceiveScreenText>}

        <QRCodeContainer>
          <QRCode value={getAddress()} size={180} />
        </QRCodeContainer>

        {currency !== 'BTC' && !!selectedAccount?.bnsName && (
          <BnsNameText>{selectedAccount?.bnsName}</BnsNameText>
        )}
        <InfoContainer>
          <AddressText>
            { getAddress() }
          </AddressText>
        </InfoContainer>
      </Container>
      {addressCopied ? (
        <CopyContainer>
          <ActionButton
            src={Copy}
            text={t('COPIED_ADDRESS')}
            onPress={handleOnClick}
            buttonColor="transparent"
            buttonBorderColor={Theme.colors.background.elevation6}
          />
        </CopyContainer>
      ) : (
        <CopyContainer>
          <ActionButton src={Copy} text={t('COPY_ADDRESS')} onPress={handleOnClick} />
        </CopyContainer>
      )}
    </>
  );
}

export default Receive;
