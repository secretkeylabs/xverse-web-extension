import keystoneConnectDefaultIcon from '@assets/img/hw/keystone/keystone_connect_default.svg';
import keystoneConnectBtcIcon from '@assets/img/hw/keystone/keystone_import_connect_btc.svg';
import ledgerConnectDefaultIcon from '@assets/img/hw/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/hw/ledger/ledger_import_connect_btc.svg';
import { delay } from '@common/utils/promises';
import ConfirmScreen from '@components/confirmScreen';
import InfoContainer from '@components/infoContainer';
import KeystoneConnectionView from '@components/keystone/connectKeystoneView';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useVault from '@hooks/useVault';
import useWalletSelector from '@hooks/useWalletSelector';
import { createKeystoneTransport } from '@keystonehq/hw-transport-webusb';
import Transport from '@ledgerhq/hw-transport-webusb';
import CollapsibleContainer from '@screens/signatureRequest/collapsableContainer';
import SignatureRequestMessage from '@screens/signatureRequest/signatureRequestMessage';
import {
  bip0322Hash,
  MessageSigningProtocols,
  signMessage,
  type AccountType,
  type SignedMessage,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Sheet from '@ui-library/sheet';
import { getTruncatedAddress, isKeystoneAccount, isLedgerAccount } from '@utils/helper';
import { handleKeystoneMessageSigning } from '@utils/keystone';
import { handleLedgerMessageSigning } from '@utils/ledger';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionDisclaimer,
  MainContainer,
  MessageHash,
  RequestType,
  SigningAddress,
  SigningAddressContainer,
  SigningAddressTitle,
  SigningAddressType,
  SigningAddressValue,
  SuccessActionsContainer,
} from './index.styled';

interface MessageSigningProps {
  address: string;
  message: string;
  protocol: MessageSigningProtocols;
  onSigned: (signedMessage: SignedMessage) => Promise<void>;
  onSignedError?: (error: unknown) => void;
  onCancel: () => void;
  header?: React.ReactNode;
}

function MessageSigning({
  address,
  message,
  protocol,
  onSigned,
  onSignedError,
  onCancel,
  header,
}: MessageSigningProps) {
  const { t } = useTranslation('translation');
  const { network } = useWalletSelector();
  const selectedAccount = useSelectedAccount();
  const vault = useVault();

  const [isSigning, setIsSigning] = useState(false);

  // Ledger state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTxRejected, setIsTxRejected] = useState(false);
  const [isTxInvalid, setIsTxInvalid] = useState(false);

  const [accountType, setAccountType] = useState<AccountType>('software');

  const getConfirmationError = (type: 'title' | 'subtitle') => {
    if (type === 'title') {
      if (isTxRejected) {
        return t('SIGNATURE_REQUEST.LEDGER.CONFIRM.DENIED.ERROR_TITLE');
      }

      if (isTxInvalid) {
        return t('SIGNATURE_REQUEST.LEDGER.CONFIRM.INVALID.ERROR_TITLE');
      }

      return t('SIGNATURE_REQUEST.LEDGER.CONFIRM.ERROR_TITLE');
    }

    if (isTxRejected) {
      return t('SIGNATURE_REQUEST.LEDGER.CONFIRM.DENIED.ERROR_SUBTITLE');
    }

    if (isTxInvalid) {
      return t('SIGNATURE_REQUEST.LEDGER.CONFIRM.INVALID.ERROR_SUBTITLE');
    }

    return t('SIGNATURE_REQUEST.LEDGER.CONFIRM.ERROR_SUBTITLE');
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsTxInvalid(false);
    setIsConnectFailed(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  const handleLedgerConnectAndConfirm = useCallback(async () => {
    if (!selectedAccount) {
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

    try {
      const signedMessage = await handleLedgerMessageSigning({
        transport,
        addressIndex: selectedAccount.deviceAccountIndex,
        address,
        networkType: network.type,
        message,
        protocol,
      });
      await onSigned(signedMessage);
    } catch (e: any) {
      onSignedError?.(e);
      if (e.name === 'LockedDeviceError') {
        setCurrentStepIndex(0);
        setIsConnectSuccess(false);
        setIsConnectFailed(true);
      } else if (e.statusCode === 28160) {
        setIsConnectSuccess(false);
        setIsConnectFailed(true);
      } else if (e.cause === 27012) {
        setIsTxInvalid(true);
      } else {
        setIsTxRejected(true);
      }
    } finally {
      await transport.close();
      setIsButtonDisabled(false);
    }
  }, [address, message, network.type, onSigned, onSignedError, protocol, selectedAccount]);

  const handleKeystoneConnectAndConfirm = useCallback(async () => {
    if (!selectedAccount) {
      return;
    }
    setIsButtonDisabled(true);

    const transport = await createKeystoneTransport();

    if (!transport) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
      return;
    }

    setIsConnectSuccess(true);
    await delay(1500);
    setCurrentStepIndex(1);

    try {
      const signedMessage = await handleKeystoneMessageSigning({
        transport,
        addressIndex: selectedAccount.deviceAccountIndex,
        address,
        networkType: network.type,
        message,
        protocol,
        mfp: selectedAccount.masterPubKey,
        xpub: {
          btc: selectedAccount.btcXpub,
          ordinals: selectedAccount.ordinalsXpub,
        },
      });
      await onSigned(signedMessage);
    } catch (e: any) {
      onSignedError?.(e);
      if (e.name === 'LockedDeviceError') {
        setCurrentStepIndex(0);
        setIsConnectSuccess(false);
        setIsConnectFailed(true);
      } else if (e.statusCode === 28160) {
        setIsConnectSuccess(false);
        setIsConnectFailed(true);
      } else if (e.cause === 27012) {
        setIsTxInvalid(true);
      } else {
        setIsTxRejected(true);
      }
    } finally {
      await transport.close();
      setIsButtonDisabled(false);
    }
  }, [address, message, network.type, onSigned, onSignedError, protocol, selectedAccount]);

  const handleConnectAndConfirm = useCallback(async () => {
    if (accountType === 'ledger') {
      handleLedgerConnectAndConfirm();
    } else if (accountType === 'keystone') {
      handleKeystoneConnectAndConfirm();
    }
  }, [accountType, handleKeystoneConnectAndConfirm, handleLedgerConnectAndConfirm]);

  const confirmCallback = async () => {
    try {
      setIsSigning(true);
      if (selectedAccount.accountType !== 'software') {
        if (isLedgerAccount(selectedAccount)) {
          setAccountType('ledger');
        } else if (isKeystoneAccount(selectedAccount)) {
          setAccountType('keystone');
        }
        setIsModalVisible(true);
        return;
      }
      const { rootNode, derivationType } = await vault.SeedVault.getWalletRootNode(
        selectedAccount.walletId,
      );
      const signedMessage = await signMessage({
        message,
        address,
        rootNode,
        network: network.type,
        protocol,
        accountIndex: BigInt(selectedAccount.id),
        derivationType,
      });
      await onSigned(signedMessage);
    } catch (err) {
      onSignedError?.(err);
    } finally {
      setIsSigning(false);
    }
  };

  const addressType =
    address === selectedAccount.btcAddress
      ? t('SIGNATURE_REQUEST.SIGNING_ADDRESS_PAYMENT')
      : address === selectedAccount.ordinalsAddress
      ? t('SIGNATURE_REQUEST.SIGNING_ADDRESS_ORDINALS')
      : undefined;

  return (
    <>
      <ConfirmScreen
        onConfirm={confirmCallback}
        onCancel={onCancel}
        cancelText={t('SIGNATURE_REQUEST.CANCEL_BUTTON')}
        confirmText={t('SIGNATURE_REQUEST.SIGN_BUTTON')}
        loading={isSigning}
      >
        {header}
        <MainContainer>
          <RequestType>{t('SIGNATURE_REQUEST.TITLE')}</RequestType>
          <SignatureRequestMessage message={message} />
          <CollapsibleContainer
            text={bip0322Hash(message)}
            title={t('SIGNATURE_REQUEST.MESSAGE_HASH_HEADER')}
          >
            <MessageHash>{bip0322Hash(message)}</MessageHash>
          </CollapsibleContainer>
          <SigningAddressContainer>
            <SigningAddressTitle>
              {t('SIGNATURE_REQUEST.SIGNING_ADDRESS_TITLE')}
            </SigningAddressTitle>
            <SigningAddress>
              {addressType && <SigningAddressType>{addressType}</SigningAddressType>}
              <SigningAddressValue data-testid="signing-address">
                {getTruncatedAddress(address, 6)}
              </SigningAddressValue>
            </SigningAddress>
          </SigningAddressContainer>
          <ActionDisclaimer>{t('SIGNATURE_REQUEST.ACTION_DISCLAIMER')}</ActionDisclaimer>
          <InfoContainer bodyText={t('SIGNATURE_REQUEST.SIGNING_WARNING')} type="Info" />
        </MainContainer>
      </ConfirmScreen>
      <Sheet visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        {
          {
            ledger: (
              <>
                {currentStepIndex === 0 && (
                  <LedgerConnectionView
                    title={t('SIGNATURE_REQUEST.LEDGER.CONNECT.TITLE')}
                    text={t('SIGNATURE_REQUEST.LEDGER.CONNECT.SUBTITLE', {
                      name: 'Bitcoin',
                    })}
                    titleFailed={t('SIGNATURE_REQUEST.LEDGER.CONNECT.ERROR_TITLE')}
                    textFailed={t('SIGNATURE_REQUEST.LEDGER.CONNECT.ERROR_SUBTITLE')}
                    imageDefault={ledgerConnectBtcIcon}
                    isConnectSuccess={isConnectSuccess}
                    isConnectFailed={isConnectFailed}
                  />
                )}
                {currentStepIndex === 1 && (
                  <LedgerConnectionView
                    title={t('SIGNATURE_REQUEST.LEDGER.CONFIRM.TITLE')}
                    text={t('SIGNATURE_REQUEST.LEDGER.CONFIRM.SUBTITLE')}
                    titleFailed={getConfirmationError('title')}
                    textFailed={getConfirmationError('subtitle')}
                    imageDefault={ledgerConnectDefaultIcon}
                    isConnectSuccess={false}
                    isConnectFailed={isTxRejected || isTxInvalid || isConnectFailed}
                  />
                )}
              </>
            ),
            keystone: (
              <>
                {currentStepIndex === 0 && (
                  <KeystoneConnectionView
                    title={t('SIGNATURE_REQUEST.KEYSTONE.CONNECT.TITLE')}
                    text={t('SIGNATURE_REQUEST.KEYSTONE.CONNECT.SUBTITLE', {
                      name: 'Bitcoin',
                    })}
                    titleFailed={t('SIGNATURE_REQUEST.KEYSTONE.CONNECT.ERROR_TITLE')}
                    textFailed={t('SIGNATURE_REQUEST.KEYSTONE.CONNECT.ERROR_SUBTITLE')}
                    imageDefault={keystoneConnectBtcIcon}
                    isConnectSuccess={isConnectSuccess}
                    isConnectFailed={isConnectFailed}
                  />
                )}
                {currentStepIndex === 1 && (
                  <KeystoneConnectionView
                    title={t('SIGNATURE_REQUEST.KEYSTONE.CONFIRM.TITLE')}
                    text={t('SIGNATURE_REQUEST.KEYSTONE.CONFIRM.SUBTITLE')}
                    titleFailed={getConfirmationError('title')}
                    textFailed={getConfirmationError('subtitle')}
                    imageDefault={keystoneConnectDefaultIcon}
                    isConnectSuccess={false}
                    isConnectFailed={isTxRejected || isTxInvalid || isConnectFailed}
                  />
                )}
              </>
            ),
          }[accountType]
        }
        <SuccessActionsContainer>
          <Button
            onClick={
              isTxRejected || isTxInvalid || isConnectFailed ? handleRetry : handleConnectAndConfirm
            }
            title={t(
              isTxRejected || isTxInvalid || isConnectFailed
                ? 'SIGNATURE_REQUEST.LEDGER.RETRY_BUTTON'
                : 'SIGNATURE_REQUEST.LEDGER.CONNECT_BUTTON',
            )}
            disabled={isButtonDisabled}
            loading={isButtonDisabled}
            variant="primary"
          />
          <Button
            onClick={onCancel}
            title={t('SIGNATURE_REQUEST.LEDGER.CANCEL_BUTTON')}
            variant="secondary"
          />
        </SuccessActionsContainer>
      </Sheet>
    </>
  );
}

export default MessageSigning;
