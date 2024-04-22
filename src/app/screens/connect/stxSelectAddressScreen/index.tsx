import stxIcon from '@assets/img/dashboard/stx_icon.svg';
import ActionButton from '@components/button';
import useStxAddressRequest from '@hooks/useStxAddressRequest';
import useWalletSelector from '@hooks/useWalletSelector';
import { animated, useTransition } from '@react-spring/web';
import { AddressPurpose } from '@sats-connect/core';
import SelectAccount from '@screens/connect/selectAccount';
import { getAppIconFromWebManifest } from '@secretkeylabs/xverse-core';
import { StickyHorizontalSplitButtonContainer } from '@ui-library/common.styled';
import Spinner from '@ui-library/spinner';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddressPurposeBox from '../addressPurposeBox';
import {
  AddressBoxContainer,
  DapURL,
  HeadingContainer,
  LoaderContainer,
  OuterContainer,
  PermissionsContainer,
  RequestMessage,
  Title,
  TopImage,
} from '../btcSelectAddressScreen/index.styled';
import PermissionsList from '../permissionsList';

function StxSelectAddressScreen() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'SELECT_BTC_ADDRESS_SCREEN' });
  const { network, stxAddress, selectedAccount } = useWalletSelector();
  const [appIcon, setAppIcon] = useState<string>('');
  const [isLoadingIcon, setIsLoadingIcon] = useState(false);
  const { payload, origin, approveStxAddressRequest, cancelAddressRequest } =
    useStxAddressRequest();
  const appUrl = useMemo(() => origin.replace(/(^\w+:|^)\/\//, ''), [origin]);

  const transition = useTransition(isLoadingIcon, {
    from: { opacity: 0, y: 30 },
    enter: { opacity: 1, y: 0 },
  });

  const confirmCallback = async () => {
    setLoading(true);
    approveStxAddressRequest();
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
          currency: 'STX',
          errorTitle: t('NETWORK_MISMATCH_ERROR_TITLE'),
          error: t('NETWORK_MISMATCH_ERROR_DESCRIPTION'),
          browserTx: true,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (origin === '') {
      return;
    }

    setIsLoadingIcon(true);
    getAppIconFromWebManifest(origin)
      .then((manifestAppIcon) => {
        setAppIcon(manifestAppIcon);
      })
      .finally(() => {
        setIsLoadingIcon(false);
      });
  }, [origin]);

  const handleSwitchAccount = () => {
    navigate('/account-list?hideListActions=true');
  };

  if (isLoadingIcon) {
    return (
      <LoaderContainer>
        <Spinner color="white" size={50} />
      </LoaderContainer>
    );
  }

  return (
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
          <AddressBoxContainer>
            <AddressPurposeBox
              purpose={AddressPurpose.Stacks}
              icon={stxIcon}
              title={t('STX_ADDRESS')}
              address={stxAddress}
              bnsName={selectedAccount?.bnsName}
            />
          </AddressBoxContainer>
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

export default StxSelectAddressScreen;
