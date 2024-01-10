import BitcoinIcon from '@assets/img/dashboard/bitcoin_icon.svg';
import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectStxIcon from '@assets/img/ledger/ledger_import_connect_stx.svg';
import stxIcon from '@assets/img/ledger/stx_icon.svg';
import { MESSAGE_SOURCE } from '@common/types/message-types';
import { delay } from '@common/utils/ledger';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import ConfirmScreen from '@components/confirmScreen';
import InfoContainer from '@components/infoContainer';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import SelectAccount from '@components/selectAccount';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { Check } from '@phosphor-icons/react';
import {
  AuthRequest,
  createAuthResponse,
  handleLedgerStxJWTAuth,
} from '@secretkeylabs/xverse-core';
import { AddressVersion, StacksMessageType, publicKeyToAddress } from '@stacks/transactions';
import { getTruncatedAddress, isHardwareAccount } from '@utils/helper';
import { decodeToken } from 'jsontokens';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import validUrl from 'valid-url';

const MainContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  overflow: 'hidden',
  marginLeft: 16,
  marginRight: 16,
});

const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(20),
}));

const TopImage = styled.img((props) => ({
  maxHeight: 48,
  maxWidth: 48,
  marginTop: props.theme.space.xxl,
}));

const FunctionTitle = styled.h1((props) => ({
  ...props.theme.typography.body_bold_l,
  color: props.theme.colors.white_0,
  marginTop: 12,
}));

const DappTitle = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  marginTop: props.theme.spacing(2),
  marginBottom: props.theme.spacing(12),
  textAlign: 'center',
}));

const InfoContainerWrapper = styled.div((props) => ({
  margin: props.theme.spacing(10),
  marginBottom: 0,
}));

const AddressesContainer = styled.div((props) => ({
  marginTop: props.theme.space.s,
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

const PermissionsContainer = styled.div({
  width: '100%',
});

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

function AuthenticationRequest() {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxApproved, setIsTxApproved] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);
  const { t } = useTranslation('translation', { keyPrefix: 'AUTH_REQUEST_SCREEN' });
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const authRequestToken = params.get('authRequest') ?? '';
  const authRequest = decodeToken(authRequestToken) as unknown as AuthRequest;
  const { selectedAccount } = useWalletSelector();
  const { getSeed } = useSeedVault();
  const theme = useTheme();
  const isDisabled = !selectedAccount?.stxAddress;

  const confirmCallback = async () => {
    setLoading(true);
    try {
      if (isHardwareAccount(selectedAccount) && !isDisabled) {
        setIsModalVisible(true);
        return;
      }

      const seedPhrase = await getSeed();
      const authResponse = await createAuthResponse(
        seedPhrase,
        selectedAccount?.id ?? 0,
        authRequest,
        {
          btcAddress: selectedAccount?.btcAddress,
        },
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

  const getDappLogo = useCallback(
    () =>
      validUrl.isWebUri(authRequest?.payload?.appDetails?.icon) ? (
        <TopImage src={authRequest?.payload?.appDetails?.icon} alt="Dapp Logo" />
      ) : null,
    [authRequest],
  );

  const handleConnectAndConfirm = async () => {
    if (!selectedAccount) {
      console.error('No account selected');
      return;
    }

    if (selectedAccount.deviceAccountIndex === undefined) {
      console.error('No account found');
      return;
    }
    setIsButtonDisabled(true);

    const transport = await Transport.create();

    if (!transport) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
      return;
    }

    setIsConnectSuccess(true);
    await delay(1500);
    setCurrentStepIndex(1);

    const profile = {
      stxAddress: {
        mainnet: selectedAccount.stxAddress,
        testnet: publicKeyToAddress(AddressVersion.MainnetSingleSig, {
          data: Buffer.from(selectedAccount.stxPublicKey, 'hex'),
          type: StacksMessageType.PublicKey,
        }),
      },
    };

    try {
      const authResponse = await handleLedgerStxJWTAuth({
        transport,
        addressIndex: selectedAccount.deviceAccountIndex,
        profile,
      });
      setIsTxApproved(true);
      await delay(1500);
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
      setIsTxRejected(true);
      setIsButtonDisabled(false);
    } finally {
      await transport.close();
    }
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  const handleSwitchAccount = () => {
    navigate('/account-list');
  };

  return (
    <ConfirmScreen
      onConfirm={confirmCallback}
      onCancel={cancelCallback}
      confirmText={t('CONNECT_BUTTON')}
      cancelText={t('CANCEL_BUTTON')}
      loading={loading}
      disabled={isDisabled}
    >
      <MainContainer>
        {getDappLogo()}
        <FunctionTitle>{t('TITLE')}</FunctionTitle>
        <DappTitle>{`${t('REQUEST_TOOLTIP')} ${authRequest.payload.appDetails?.name}`}</DappTitle>
        <SelectAccount account={selectedAccount!} handlePressAccount={handleSwitchAccount} />
        <AddressesContainer>
          <AddressBox>
            <AddressContainer>
              <AddressImage src={stxIcon} />
              <AddressTextTitle>{t('STX_ADDRESS')}</AddressTextTitle>
            </AddressContainer>
            <div>
              {selectedAccount?.bnsName ? <BnsName>{selectedAccount?.bnsName}</BnsName> : null}
              <TruncatedAddress>
                {getTruncatedAddress(selectedAccount?.stxAddress!)}
              </TruncatedAddress>
            </div>
          </AddressBox>
          <AddressBox>
            <AddressContainer>
              <AddressImage src={BitcoinIcon} />
              <AddressTextTitle>{t('BITCOIN_ADDRESS')}</AddressTextTitle>
            </AddressContainer>
            <TruncatedAddress>{getTruncatedAddress(selectedAccount?.btcAddress!)}</TruncatedAddress>
          </AddressBox>
        </AddressesContainer>
        <PermissionsContainer>
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
        </PermissionsContainer>
        {isDisabled && (
          <InfoContainerWrapper>
            <InfoContainer
              bodyText={t('NO_STACKS_AUTH_SUPPORT.TITLE')}
              redirectText={t('NO_STACKS_AUTH_SUPPORT.LINK')}
              onClick={async () => {
                await chrome.tabs.create({
                  url: chrome.runtime.getURL(`options.html#/add-stx-address-ledger`),
                });

                window.close();
              }}
            />
          </InfoContainerWrapper>
        )}
      </MainContainer>
      <BottomModal header="" visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        {currentStepIndex === 0 && (
          <LedgerConnectionView
            title={t('LEDGER.CONNECT.TITLE')}
            text={t('LEDGER.CONNECT.SUBTITLE')}
            titleFailed={t('LEDGER.CONNECT.ERROR_TITLE')}
            textFailed={t('LEDGER.CONNECT.ERROR_SUBTITLE')}
            imageDefault={ledgerConnectStxIcon}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
          />
        )}
        {currentStepIndex === 1 && (
          <LedgerConnectionView
            title={t('LEDGER.CONFIRM.TITLE')}
            text={t('LEDGER.CONFIRM.SUBTITLE')}
            titleFailed={t('LEDGER.CONFIRM.ERROR_TITLE')}
            textFailed={t('LEDGER.CONFIRM.ERROR_SUBTITLE')}
            imageDefault={ledgerConnectDefaultIcon}
            isConnectSuccess={isTxApproved}
            isConnectFailed={isTxRejected}
          />
        )}
        <SuccessActionsContainer>
          <ActionButton
            onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
            text={t(isTxRejected || isConnectFailed ? 'LEDGER.RETRY_BUTTON' : 'CONNECT_BUTTON')}
            disabled={isButtonDisabled}
            processing={isButtonDisabled}
          />
          <ActionButton onPress={cancelCallback} text={t('CANCEL_BUTTON')} transparent />
        </SuccessActionsContainer>
      </BottomModal>
    </ConfirmScreen>
  );
}

export default AuthenticationRequest;
