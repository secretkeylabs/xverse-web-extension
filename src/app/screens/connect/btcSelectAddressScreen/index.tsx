import BitcoinIcon from '@assets/img/dashboard/bitcoin_icon.svg';
import stxIcon from '@assets/img/dashboard/stx_icon.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import ActionButton from '@components/button';
import useWalletSelector from '@hooks/useWalletSelector';
import { animated, useTransition } from '@react-spring/web';
import SelectAccount from '@screens/connect/selectAccount';
import { getAppIconFromWebManifest } from '@secretkeylabs/xverse-core';
import { StickyHorizontalSplitButtonContainer } from '@ui-library/common.styled';
import Spinner from '@ui-library/spinner';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AddressPurpose } from 'sats-connect';
import styled from 'styled-components';
import AddressPurposeBox from '../addressPurposeBox';
import PermissionsList from '../permissionsList';
import useBtcAddressRequest from './useBtcAddressRequest';

const OuterContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  ...props.theme.scrollbar,
}));

const HeadingContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 48,
});

const AddressBoxContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  marginTop: props.theme.spacing(12),
}));

const TopImage = styled.img((props) => ({
  maxHeight: 48,
  borderRadius: props.theme.radius(2),
  maxWidth: 48,
  marginBottom: props.theme.space.m,
}));

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  color: props.theme.colors.white_0,
}));

const DapURL = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  marginTop: props.theme.spacing(2),
  textAlign: 'center',
}));

const RequestMessage = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  textAlign: 'left',
  wordWrap: 'break-word',
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(12),
}));

const PermissionsContainer = styled.div((props) => ({
  paddingBottom: props.theme.space.xxl,
}));

const LoaderContainer = styled.div(() => ({
  justifySelf: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
}));

function BtcSelectAddressScreen() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'SELECT_BTC_ADDRESS_SCREEN' });
  const { network, btcAddress, ordinalsAddress, stxAddress, selectedAccount } = useWalletSelector();
  const [appIcon, setAppIcon] = useState<string>('');
  const [isLoadingIcon, setIsLoadingIcon] = useState(false);
  const { payload, origin, approveBtcAddressRequest, cancelAddressRequest } =
    useBtcAddressRequest();
  const appUrl = useMemo(() => origin.replace(/(^\w+:|^)\/\//, ''), [origin]);

  const transition = useTransition(isLoadingIcon, {
    from: { opacity: 0, y: 30 },
    enter: { opacity: 1, y: 0 },
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

  useEffect(() => {
    // Handle address requests to a network that's not currently active
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
    // Handle address requests with an unsupported purpose
    payload.purposes.forEach((purpose) => {
      if (
        purpose !== AddressPurpose.Ordinals &&
        purpose !== AddressPurpose.Payment &&
        purpose !== AddressPurpose.Stacks
      ) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle: t('INVALID_PURPOSE_ERROR_TITLE'),
            error: t('INVALID_PURPOSE_ERROR_DESCRIPTION'),
            browserTx: true,
          },
        });
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (origin !== '') {
        setIsLoadingIcon(true);
        getAppIconFromWebManifest(origin)
          .then((appIcons) => {
            setAppIcon(appIcons);
            setIsLoadingIcon(false);
          })
          .catch(() => {
            setIsLoadingIcon(false);
            setAppIcon('');
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
        <AddressPurposeBox
          key={purpose}
          purpose={purpose}
          icon={BitcoinIcon}
          title={t('BITCOIN_ADDRESS')}
          address={btcAddress}
        />
      );
    }
    if (purpose === AddressPurpose.Ordinals) {
      return (
        <AddressPurposeBox
          key={purpose}
          purpose={purpose}
          icon={OrdinalsIcon}
          title={t('ORDINAL_ADDRESS')}
          address={ordinalsAddress}
        />
      );
    }
    if (purpose === AddressPurpose.Stacks) {
      return (
        <AddressPurposeBox
          key={purpose}
          purpose={purpose}
          icon={stxIcon}
          title={t('STX_ADDRESS')}
          address={stxAddress}
          bnsName={selectedAccount?.bnsName}
        />
      );
    }
  }, []);

  const handleSwitchAccount = () => {
    navigate('/account-list?hideListActions=true');
  };

  return isLoadingIcon ? (
    <LoaderContainer>
      <Spinner color="white" size={50} />
    </LoaderContainer>
  ) : (
    <OuterContainer>
      {transition((style) => (
        <animated.div style={style}>
          <HeadingContainer>
            {appIcon !== '' ? <TopImage src={appIcon} alt="Dapp Logo" /> : null}
            <Title>{t('TITLE')}</Title>
            <DapURL>{appUrl}</DapURL>
          </HeadingContainer>
          {payload.message ? (
            <RequestMessage>{payload.message.substring(0, 80)}</RequestMessage>
          ) : null}
          <SelectAccount account={selectedAccount!} handlePressAccount={handleSwitchAccount} />
          <AddressBoxContainer>{payload.purposes.map(AddressPurposeRow)}</AddressBoxContainer>
          <PermissionsContainer>
            <PermissionsList />
          </PermissionsContainer>
          <StickyHorizontalSplitButtonContainer>
            <ActionButton text={t('CANCEL_BUTTON')} transparent onPress={cancelCallback} />
            <ActionButton
              text={t('CONNECT_BUTTON')}
              processing={loading}
              onPress={confirmCallback}
            />
          </StickyHorizontalSplitButtonContainer>
        </animated.div>
      ))}
    </OuterContainer>
  );
}

export default BtcSelectAddressScreen;
