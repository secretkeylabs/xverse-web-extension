import BitcoinIcon from '@assets/img/dashboard/bitcoin_icon.svg';
import stxIcon from '@assets/img/ledger/stx_icon.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import ActionButton from '@components/button';
import SelectAccount from '@components/selectAccount';
import useBtcAddressRequest from '@hooks/useBtcAddressRequest';
import useWalletSelector from '@hooks/useWalletSelector';
import { Check } from '@phosphor-icons/react';
import { animated, useSpring } from '@react-spring/web';
import { StickyHorizontalSplitButtonContainer } from '@ui-library/common.styled';
import { getTruncatedAddress } from '@utils/helper';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AddressPurpose } from 'sats-connect';
import styled, { useTheme } from 'styled-components';
import { getAppIconFromWebManifest } from './helper';

const TitleContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  marginLeft: 30,
  marginRight: 30,
  marginTop: 48,
});

const OuterContainer = styled(animated.div)({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: 16,
  marginRight: 16,
});

const AddressBoxContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  marginTop: props.theme.spacing(12),
}));

const AddressBox = styled.div((props) => ({
  width: 328,
  height: 66,
  padding: props.theme.spacing(10),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: props.theme.colors.elevation6_800,
  marginBottom: 1,
  ':first-of-type': {
    borderTopLeftRadius: props.theme.radius(2),
    borderTopRightRadius: props.theme.radius(2),
  },
  ':last-of-type': {
    borderBottomLeftRadius: props.theme.radius(2),
    borderBottomRightRadius: props.theme.radius(2),
  },
}));

const AddressContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const TopImage = styled.img({
  maxHeight: 48,
  maxWidth: 48,
});

const Title = styled.h1((props) => ({
  ...props.theme.typography.body_bold_l,
  color: props.theme.colors.white_0,
  marginTop: 12,
}));

const DapURL = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  marginTop: 4,
  textAlign: 'center',
}));

const AddressImage = styled.img({
  width: 24,
  height: 24,
  marginRight: 8,
});

const AddressTextTitle = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  textAlign: 'center',
}));

const TruncatedAddress = styled.h3((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'right',
}));

const BnsName = styled.h3((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'right',
}));

const RequestMessage = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  textAlign: 'left',
  wordWrap: 'break-word',
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(12),
}));

const PermissionsTitle = styled.h3((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  textAlign: 'left',
  marginTop: 24,
}));

const Permission = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  marginTop: 12,
  display: 'flex',
  alignContent: 'center',
}));

const PermissionIcon = styled.div({
  marginRight: 4,
});

const ActionsContainer = styled(StickyHorizontalSplitButtonContainer)({
  marginTop: 'auto',
});

function BtcSelectAddressScreen() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation('translation', { keyPrefix: 'SELECT_BTC_ADDRESS_SCREEN' });
  const { network, btcAddress, ordinalsAddress, stxAddress, selectedAccount } = useWalletSelector();
  const [appIcon, setAppIcon] = useState<string>('');
  const { payload, origin, approveBtcAddressRequest, cancelAddressRequest } =
    useBtcAddressRequest();
  const appUrl = useMemo(() => origin.replace(/(^\w+:|^)\/\//, ''), [origin]);

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

  useEffect(() => {
    switchAccountBasedOnRequest();
  }, []);

  useEffect(() => {
    (async () => {
      if (origin !== '') {
        getAppIconFromWebManifest(origin).then((appIcons) => {
          setAppIcon(appIcons);
        });
      }
    })();

    return () => {
      setAppIcon('');
    };
  }, [origin]);

  const AddressPurposeRow = useCallback((purpose: AddressPurpose) => {
    if (purpose === AddressPurpose.Payment) {
      return (
        <AddressBox key={purpose}>
          <AddressContainer>
            <AddressImage src={BitcoinIcon} />
            <AddressTextTitle>{t('BITCOIN_ADDRESS')}</AddressTextTitle>
          </AddressContainer>
          <TruncatedAddress>{getTruncatedAddress(btcAddress)}</TruncatedAddress>
        </AddressBox>
      );
    }
    if (purpose === AddressPurpose.Ordinals) {
      return (
        <AddressBox key={purpose}>
          <AddressContainer>
            <AddressImage src={OrdinalsIcon} />
            <AddressTextTitle>{t('ORDINAL_ADDRESS')}</AddressTextTitle>
          </AddressContainer>
          <TruncatedAddress>{getTruncatedAddress(ordinalsAddress)}</TruncatedAddress>
        </AddressBox>
      );
    }
    return (
      <AddressBox key={purpose}>
        <AddressContainer>
          <AddressImage src={stxIcon} />
          <AddressTextTitle>{t('STX_ADDRESS')}</AddressTextTitle>
        </AddressContainer>
        <div>
          {selectedAccount?.bnsName ? <BnsName>{selectedAccount?.bnsName}</BnsName> : null}
          <TruncatedAddress>{getTruncatedAddress(stxAddress)}</TruncatedAddress>
        </div>
      </AddressBox>
    );
  }, []);

  const handleSwitchAccount = () => {
    navigate('/account-list');
  };

  return (
    <OuterContainer style={styles}>
      <TitleContainer>
        {appIcon !== '' ? <TopImage src={appIcon} alt="Dapp Logo" /> : null}
        <Title>{t('TITLE')}</Title>
        <DapURL>{appUrl}</DapURL>
      </TitleContainer>
      {payload.message ? <RequestMessage>{payload.message.substring(0, 80)}</RequestMessage> : null}
      <SelectAccount account={selectedAccount!} handlePressAccount={handleSwitchAccount} />
      <AddressBoxContainer>{payload.purposes.map(AddressPurposeRow)}</AddressBoxContainer>
      <PermissionsTitle>{t('PERMISSIONS_TITLE')}</PermissionsTitle>
      <Permission>
        <PermissionIcon>
          <Check color={theme.colors.success_light} />
        </PermissionIcon>
        {t('PERMISSION_WALLET_BALANCE')}
      </Permission>
      <Permission>
        <PermissionIcon>
          <Check color={theme.colors.success_light} />
        </PermissionIcon>
        {t('PERMISSION_REQUEST_TX')}
      </Permission>
      <ActionsContainer>
        <ActionButton text={t('CANCEL_BUTTON')} transparent onPress={cancelCallback} />
        <ActionButton text={t('CONNECT_BUTTON')} processing={loading} onPress={confirmCallback} />
      </ActionsContainer>
    </OuterContainer>
  );
}

export default BtcSelectAddressScreen;
