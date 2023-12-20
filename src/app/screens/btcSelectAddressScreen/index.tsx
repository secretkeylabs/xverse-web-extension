import BitcoinIcon from '@assets/img/dashboard/bitcoin_icon.svg';
import stxIcon from '@assets/img/ledger/stx_icon.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import DappPlaceholderIcon from '@assets/img/webInteractions/authPlaceholder.svg';
import AccountHeaderComponent from '@components/accountHeader';
import ActionButton from '@components/button';
import useBtcAddressRequest from '@hooks/useBtcAddressRequest';
import useWalletSelector from '@hooks/useWalletSelector';
import { animated, useSpring } from '@react-spring/web';
import { StickyHorizontalSplitButtonContainer } from '@ui-library/common.styled';
import { getTruncatedAddress } from '@utils/helper';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AddressPurpose } from 'sats-connect';
import styled from 'styled-components';

const TitleContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  marginLeft: 30,
  marginRight: 30,
});

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  marginTop: props.theme.spacing(12),
}));

const AddressBox = styled.div((props) => ({
  borderRadius: props.theme.radius(2),
  width: 328,
  height: 66,
  padding: props.theme.spacing(8),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  border: `1px solid var(--white-850, rgba(255, 255, 255, 0.15))`,
  marginBottom: props.theme.spacing(4),
}));

const AddressContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

const TopImage = styled.img({
  height: 88,
});

const Title = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  color: props.theme.colors.white_0,
  marginTop: 12,
}));

const DapURL = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_400,
  marginTop: 4,
  textAlign: 'center',
}));

const AddressTextTitle = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_400,
  textAlign: 'center',
}));

const TruncatedAddress = styled.h3((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const RequestMessage = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
  textAlign: 'left',
  wordWrap: 'break-word',
  marginTop: 12,
}));

const OuterContainer = styled(animated.div)({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: 16,
  marginRight: 16,
});

const OrdinalImage = styled.img({
  width: 24,
  height: 24,
  marginRight: 8,
});

function BtcSelectAddressScreen() {
  const [loading, setLoading] = useState(false);
  const [appIcon, setAppIcon] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'SELECT_BTC_ADDRESS_SCREEN' });
  const { network, btcAddress, ordinalsAddress, stxAddress } = useWalletSelector();
  const { payload, origin, approveBtcAddressRequest, cancelAddressRequest } =
    useBtcAddressRequest();

  const styles = useSpring({
    from: {
      opacity: 0,
      y: 24,
    },
    to: {
      y: 0,
      opacity: 1,
    },
  });

  const confirmCallback = async () => {
    setLoading(true);
    approveBtcAddressRequest();
    window.close();
  };

  const cancelCallback = () => {
    cancelAddressRequest();
    window.close();
  };

  const switchAccountBasedOnRequest = () => {
    if (payload.network.type !== network.type) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          errorTitle: t('NETWORK_MISMATCH_ERROR_TITLE'),
          error: t('NETWORK_MISMATCH_ERROR_DESCRIPTION'),
          browserTx: true,
        },
      });
    }
  };
  const AddressPurposeRow = useCallback((purpose) => {
    if (purpose === AddressPurpose.Payment) {
      return (
        <AddressBox key={purpose}>
          <OrdinalImage src={BitcoinIcon} />
          <AddressContainer>
            <AddressTextTitle>{t('BITCOIN_ADDRESS')}</AddressTextTitle>
            <TruncatedAddress>{getTruncatedAddress(btcAddress)}</TruncatedAddress>
          </AddressContainer>
        </AddressBox>
      );
    }
    if (purpose === AddressPurpose.Ordinals) {
      return (
        <AddressBox key={purpose}>
          <OrdinalImage src={OrdinalsIcon} />
          <AddressContainer>
            <AddressTextTitle>{t('ORDINAL_ADDRESS')}</AddressTextTitle>
            <TruncatedAddress>{getTruncatedAddress(ordinalsAddress)}</TruncatedAddress>
          </AddressContainer>
        </AddressBox>
      );
    }
    return (
      <AddressBox key={purpose}>
        <OrdinalImage src={stxIcon} />
        <AddressContainer>
          <AddressTextTitle>{t('STX_ADDRESS')}</AddressTextTitle>
          <TruncatedAddress>{getTruncatedAddress(stxAddress)}</TruncatedAddress>
        </AddressContainer>
      </AddressBox>
    );
  }, []);

  useEffect(() => {
    switchAccountBasedOnRequest();
  }, []);
  useEffect(() => {
    axios
      .get<string>(`http://www.google.com/s2/favicons?domain=${origin}`, {
        timeout: 30000,
      })
      .then((response) => setAppIcon(response.data))
      .catch((error) => '');
    return () => {
      setAppIcon('');
    };
  }, [origin]);
  return (
    <>
      <AccountHeaderComponent disableMenuOption showBorderBottom={false} />
      <OuterContainer style={styles}>
        <TitleContainer>
          <TopImage src={DappPlaceholderIcon} alt="Dapp Logo" />
          <Title>{t('TITLE')}</Title>
          <DapURL>{origin.replace(/(^\w+:|^)\/\//, '')}</DapURL>
        </TitleContainer>
        <RequestMessage>{payload.message.substring(0, 80)}</RequestMessage>
        <Container>{payload.purposes.map(AddressPurposeRow)}</Container>
        <StickyHorizontalSplitButtonContainer>
          <ActionButton text={t('CANCEL_BUTTON')} transparent onPress={cancelCallback} />
          <ActionButton text={t('CONNECT_BUTTON')} processing={loading} onPress={confirmCallback} />
        </StickyHorizontalSplitButtonContainer>
      </OuterContainer>
    </>
  );
}

export default BtcSelectAddressScreen;
