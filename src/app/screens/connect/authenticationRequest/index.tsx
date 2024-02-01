import BitcoinIcon from '@assets/img/dashboard/bitcoin_icon.svg';
import stxIcon from '@assets/img/dashboard/stx_icon.svg';
import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectStxIcon from '@assets/img/ledger/ledger_import_connect_stx.svg';
import { MESSAGE_SOURCE } from '@common/types/message-types';
import { delay } from '@common/utils/ledger';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { animated, useSpring } from '@react-spring/web';
import SelectAccount from '@screens/connect/selectAccount';
import {
  AuthRequest,
  createAuthResponse,
  handleLedgerStxJWTAuth,
} from '@secretkeylabs/xverse-core';
import { AddressVersion, StacksMessageType, publicKeyToAddress } from '@stacks/transactions';
import Callout from '@ui-library/callout';
import { StickyHorizontalSplitButtonContainer } from '@ui-library/common.styled';
import { isHardwareAccount } from '@utils/helper';
import { decodeToken } from 'jsontokens';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { AddressPurpose } from 'sats-connect';
import styled from 'styled-components';
import validUrl from 'valid-url';
import AddressPurposeBox from '../addressPurposeBox';
import PermissionsList from '../permissionsList';

const MainContainer = styled(animated.div)((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  ...props.theme.scrollbar,
}));

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
  alignSelf: 'center',
}));

const ImagePlaceholder = styled.div((props) => ({
  marginTop: props.theme.space.xxl,
}));

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  color: props.theme.colors.white_0,
  textAlign: 'center',
  marginTop: 12,
}));

const DappName = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  marginTop: props.theme.spacing(2),
  marginBottom: props.theme.spacing(12),
  textAlign: 'center',
}));

const InfoContainerWrapper = styled.div((props) => ({
  marginTop: props.theme.spacing(10),
  marginBottom: 'auto',
}));

const AddressesContainer = styled.div((props) => ({
  marginTop: props.theme.space.s,
  width: '100%',
}));

const PermissionsContainer = styled.div((props) => ({
  width: '100%',
  paddingBottom: props.theme.space.xxl,
}));

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
  const { selectedAccount, btcAddress, stxAddress } = useWalletSelector();
  const { getSeed } = useSeedVault();
  const isDisabled = !selectedAccount?.stxAddress;

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
      ) : (
        <ImagePlaceholder />
      ),
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
    navigate('/account-list?hideListActions=true');
  };

  const handleAddStxLedgerAccount = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL(`options.html#/add-stx-address-ledger`),
    });

    window.close();
  };

  return (
    <MainContainer style={styles}>
      {getDappLogo()}
      <Title>{t('TITLE')}</Title>
      <DappName>{`${t('REQUEST_TOOLTIP')} ${authRequest.payload.appDetails?.name}`}</DappName>
      <SelectAccount account={selectedAccount!} handlePressAccount={handleSwitchAccount} />
      {!isDisabled ? (
        <>
          <AddressesContainer>
            <AddressPurposeBox
              purpose={AddressPurpose.Stacks}
              icon={stxIcon}
              title={t('STX_ADDRESS')}
              address={selectedAccount?.stxAddress || stxAddress}
              bnsName={selectedAccount?.bnsName}
            />
            <AddressPurposeBox
              purpose={AddressPurpose.Payment}
              icon={BitcoinIcon}
              title={t('BITCOIN_ADDRESS')}
              address={selectedAccount?.btcAddress || btcAddress}
            />
          </AddressesContainer>
          <PermissionsContainer>
            <PermissionsList />
          </PermissionsContainer>
        </>
      ) : (
        <InfoContainerWrapper>
          <Callout
            bodyText={t('NO_STACKS_AUTH_SUPPORT.TITLE')}
            redirectText={t('NO_STACKS_AUTH_SUPPORT.LINK')}
            onClickRedirect={handleAddStxLedgerAccount}
          />
        </InfoContainerWrapper>
      )}

      <StickyHorizontalSplitButtonContainer>
        <ActionButton text={t('CANCEL_BUTTON')} transparent onPress={cancelCallback} />
        <ActionButton
          text={t('CONNECT_BUTTON')}
          processing={loading}
          onPress={confirmCallback}
          disabled={isDisabled}
        />
      </StickyHorizontalSplitButtonContainer>

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
            disabled={isButtonDisabled || isDisabled}
            processing={isButtonDisabled}
          />
          <ActionButton onPress={cancelCallback} text={t('CANCEL_BUTTON')} transparent />
        </SuccessActionsContainer>
      </BottomModal>
    </MainContainer>
  );
}

export default AuthenticationRequest;
