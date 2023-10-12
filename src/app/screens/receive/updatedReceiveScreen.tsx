import Ordinal from '@assets/img/receive_ordinals_image.svg';
import ShowBtcReceiveAlert from '@components/showBtcReceiveAlert';
import ShowOrdinalReceiveAlert from '@components/showOrdinalReceiveAlert';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useWalletSelector from '@hooks/useWalletSelector';
import { Check, Copy } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';
import QrCode from './qrCode';

export const OuterContainer = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingLeft: props.theme.spacing(4),
  paddingRight: props.theme.spacing(4),
}));

const TopTitleText = styled.h1((props) => ({
  ...props.theme.headline_s,
  textAlign: 'center',
  marginTop: props.theme.spacing(12),
}));

const DescriptionText = styled.p((props) => ({
  ...props.theme.body_m,
  textAlign: 'center',
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(6),
}));

const AddressContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  columnGap: 16,
  marginTop: props.theme.spacing(26.5),
}));

const QRCodeContainer = styled.div((props) => ({
  display: 'flex',
  backgroundColor: props.theme.colors.white['0'],
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  width: 159,
  height: 159,
  alignSelf: 'center',
  marginTop: props.theme.spacing(15),
}));

const AddressText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['200'],
  wordBreak: 'break-all',
}));

const BottomBarContainer = styled.div({
  marginTop: 22,
});

const Button = styled.button((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: props.theme.spacing(3),
  padding: 12,
  background: props.theme.colors.elevation2,
  borderRadius: 24,
  width: 40,
  height: 40,
}));

function UpdatedReceive(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'RECEIVE' });
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isBtcReceiveAlertVisible, setIsBtcReceiveAlertVisible] = useState(false);
  const [isOrdinalReceiveAlertVisible, setIsOrdinalReceiveAlertVisible] = useState(false);
  const navigate = useNavigate();
  const { stxAddress, btcAddress, ordinalsAddress, showOrdinalReceiveAlert } = useWalletSelector();

  // TODO : Get currency from param
  const currency = 'ORD';

  const getAddress = () => {
    switch (currency) {
      case 'STX':
        return stxAddress;
      case 'BTC':
        return btcAddress;
      case 'FT':
        return stxAddress;
      case 'ORD':
        return ordinalsAddress;
      default:
        return '';
    }
  };
  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const renderHeading = () => {
    if (currency === 'ORD') {
      return (
        <>
          <TopTitleText>{t('ORDINAL_ADDRESS')}</TopTitleText>
          <DescriptionText>{t('ORDINALS_RECEIVE_MESSAGE')}</DescriptionText>
        </>
      );
    }
    return (
      <>
        <TopTitleText>{t('STX_ADDRESS')}</TopTitleText>
        <DescriptionText>{t('STX_RECEIVE_MESSAGE')}</DescriptionText>
      </>
    );
  };

  const onReceiveAlertClose = () => {
    setIsBtcReceiveAlertVisible(false);
  };

  const onOrdinalReceiveAlertClose = () => {
    setIsOrdinalReceiveAlertVisible(false);
  };

  const handleOnClick = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(getAddress());
    if (currency === 'ORD' && showOrdinalReceiveAlert) {
      setIsOrdinalReceiveAlertVisible(true);
    }
  };

  return (
    <>
      <TopRow title={t('RECEIVE')} onClick={handleBackButtonClick} />
      <OuterContainer>
        {renderHeading()}
        <QRCodeContainer>
          <QrCode image={Ordinal} data={getAddress()} gradientColor="#61FF8D" />
        </QRCodeContainer>
        <AddressContainer>
          <AddressText>{getAddress()}</AddressText>
          <Button id={`copy-${getAddress()}`} onClick={handleOnClick}>
            {isCopied ? <Check color="white" size="20" /> : <Copy color="white" size="20" />}
          </Button>
          <Tooltip
            anchorId={`copy-${getAddress()}`}
            variant="light"
            content={t('COPIED_ADDRESS')}
            events={['click']}
            place="top"
          />
        </AddressContainer>
      </OuterContainer>
      <BottomBarContainer>
        <BottomTabBar tab="dashboard" />
      </BottomBarContainer>
      {isBtcReceiveAlertVisible && (
        <ShowBtcReceiveAlert onReceiveAlertClose={onReceiveAlertClose} />
      )}
      {isOrdinalReceiveAlertVisible && (
        <ShowOrdinalReceiveAlert onOrdinalReceiveAlertClose={onOrdinalReceiveAlertClose} />
      )}
    </>
  );
}

export default UpdatedReceive;
