import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import ConfirmScreen from '@components/confirmScreen';
import { decodeToken } from 'jsontokens';
import { useTranslation } from 'react-i18next';
import { createAuthResponse } from '@secretkeylabs/xverse-core';
import { useSelector } from 'react-redux';
import { StoreState } from 'app/stores/reducers/root';
import { MESSAGE_SOURCE } from 'content-scripts/message-types';

const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
}));

const TopImage = styled.img((props) => ({
  aspectRatio: 1,
  height: 88,
  borderWidth: 10,
  borderColor: 'white',
}));

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
  const { t } = useTranslation('translation', { keyPrefix: 'AUTH_REQUEST_SCREEN' });

  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const authRequestToken = params.get('authRequest') ?? '';
  const authRequest = decodeToken(authRequestToken);

  const { seedPhrase, selectedAccount } = useSelector((state: StoreState) => ({
    ...state.walletState,
  }));

  const confirmCallback = async () => {
    const authResponse = await createAuthResponse(
      seedPhrase,
      selectedAccount?.id ?? 0,
      authRequest
    );
    chrome.tabs.sendMessage(+(params.get('tabId') ?? '0'), {
      source: MESSAGE_SOURCE,
      payload: {
        authenticationRequest: authRequestToken,
        authenticationResponse: authResponse,
      },
      method: 'authenticationResponse',
    });

    alert('Done');
    // window.close();
  };

  const cancelCallback = () => {
    window.postMessage(
      JSON.stringify({
        source: MESSAGE_SOURCE,
        payload: {
          authenticationRequest: authRequestToken,
          authenticationResponse: 'cancel',
        },
        method: 'authenticationResponse',
      })
    );
    window.close();
  };

  return (
    <ConfirmScreen
      onConfirm={confirmCallback}
      onCancel={cancelCallback}
      confirmText={t('CONNECT_BUTTON')}
      cancelText={t('CANCEL_BUTTON')}
    >
      <MainContainer>
        <TopImage src={authRequest.payload.appDetails?.icon} alt="" />
        <FunctionTitle>{t('TITLE')}</FunctionTitle>
        <DappTitle>{`${t('REQUEST_TOOLTIP')} ${authRequest.payload.appDetails?.name}`}</DappTitle>
      </MainContainer>
    </ConfirmScreen>
  );
}

export default AuthenticationRequest;
