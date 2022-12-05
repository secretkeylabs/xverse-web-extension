import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import ConfirmScreen from '@components/confirmScreen';
import { decodeToken } from 'jsontokens';
import { useTranslation } from 'react-i18next';
import { createAuthResponse } from '@secretkeylabs/xverse-core';
import { MESSAGE_SOURCE } from 'content-scripts/message-types';
import { useState } from 'react';
import useWalletSelector from '@hooks/useWalletSelector';
import DappPlaceholderIcon from '@assets/img/webInteractions/authPlaceholder.svg';
import validUrl from 'valid-url';
import AccountHeaderComponent from '@components/accountHeader';

const MainContainer = styled.div({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});

const TopImage = styled.img({
  aspectRatio: 1,
  height: 88,
  borderWidth: 10,
  borderColor: 'white',
});

const FunctionTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  marginTop: 16,
}));

const DappTitle = styled.h2((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white['400'],
  marginTop: 4,
}));

function AuthenticationRequest() {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('translation', { keyPrefix: 'AUTH_REQUEST_SCREEN' });
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const authRequestToken = params.get('authRequest') ?? '';
  const authRequest = decodeToken(authRequestToken);
  const { seedPhrase, selectedAccount } = useWalletSelector();

  const confirmCallback = async () => {
    setLoading(true);
    try {
      const authResponse = await createAuthResponse(
        seedPhrase,
        selectedAccount?.id ?? 0,
        authRequest,
      );
      chrome.tabs.sendMessage(+(params.get('tabId') ?? '0'), {
        source: MESSAGE_SOURCE,
        payload: {
          authenticationRequest: authRequestToken,
          authenticationResponse: authResponse,
        },
        method: 'authenticationResponse',
      });
      window.close();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cancelCallback = () => {
    chrome.tabs.sendMessage(+(params.get('tabId') ?? '0'), {
      source: MESSAGE_SOURCE,
      payload: {
        authenticationRequest: authRequestToken,
        authenticationResponse: 'cancel',
      },
      method: 'authenticationResponse',
    });
    window.close();
  };

  const getDappLogo = () => (validUrl.isWebUri(authRequest?.payload?.appDetails?.icon) ? authRequest?.payload?.appDetails?.icon : DappPlaceholderIcon);

  return (
    <ConfirmScreen
      onConfirm={confirmCallback}
      onCancel={cancelCallback}
      confirmText={t('CONNECT_BUTTON')}
      cancelText={t('CANCEL_BUTTON')}
      loading={loading}
    >
      <AccountHeaderComponent />
      <MainContainer>
        <TopImage src={getDappLogo()} alt="Dapp Logo" />
        <FunctionTitle>{t('TITLE')}</FunctionTitle>
        <DappTitle>{`${t('REQUEST_TOOLTIP')} ${authRequest.payload.appDetails?.name}`}</DappTitle>
      </MainContainer>
    </ConfirmScreen>
  );
}

export default AuthenticationRequest;
