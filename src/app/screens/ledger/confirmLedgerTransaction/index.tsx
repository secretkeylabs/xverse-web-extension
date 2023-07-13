import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { animated, useTransition } from '@react-spring/web';
import Transport from '@ledgerhq/hw-transport-webusb';
import ActionButton from '@components/button';
import {
  broadcastSignedTransaction,
  signLedgerNativeSegwitBtcTransaction,
  signLedgerStxTransaction,
  signLedgerMixedBtcTransaction,
  getMasterFingerPrint,
} from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import useWalletSelector from '@hooks/useWalletSelector';
import { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import LedgerConnectionView, { ConnectLedgerContainer, ConnectLedgerText } from '@components/ledger/connectLedgerView';
import { ledgerDelay } from '@common/utils/ledger';
import { getBtcTxStatusUrl, getStxTxStatusUrl } from '@utils/helper';
import FullScreenHeader from '@components/ledger/fullScreenHeader';
import useBtcClient from '@hooks/useBtcClient';
import useNetworkSelector from '@hooks/useNetwork';
import { StacksTransaction } from '@stacks/transactions';
import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConfirmBtcIcon from '@assets/img/ledger/ledger_import_connect_btc.svg';
import ledgerConfirmOrdinalsIcon from '@assets/img/ledger/ledger_confirm_ordinals.svg';
import CheckCircleSVG from '@assets/img/ledger/check_circle.svg';
import InfoIcon from '@assets/img/info.svg';
import InfoContainer from '@components/infoContainer';
import LedgerFailView from '@components/ledger/failLedgerView';

export type LedgerTransactionType = 'BTC' | 'STX' | 'ORDINALS' | 'BRC-20';

const Container = styled.div`
  display: flex;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  flex-direction: column;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const OnBoardingContentContainer = styled(animated.div)((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'center',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(30),
}));

const TxConfirmedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  > :first-child {
    margin-bottom: 26px;
  }
`;
const TxConfirmedTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
}));

const TxConfirmedDescription = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
}));

const InfoImage = styled.img`
  width: 64px;
  height: 64px;
`;

export const ConnectLedgerTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginBottom: props.theme.spacing(6),
}));

interface ConnectLedgerTextAdvancedProps {
  isCompleted?: boolean;
}
export const ConnectLedgerTextAdvanced = styled.p<ConnectLedgerTextAdvancedProps>((props) => ({
  ...props.theme.body_m,
  display: 'flex',
  alignItems: 'flex-start',
  color: props.isCompleted ? props.theme.colors.white[400] : props.theme.colors.white[200],
  textAlign: 'center',
}));

const InfoContainerWrapper = styled.div(props => `
  text-align: left;
  margin-top: ${props.theme.spacing(8)}px;
`);

const ConfirmationStepsContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: props.theme.spacing(16),
}));

interface ConfirmationStepProps {
  isCompleted: boolean;
}
const ConfirmationStep = styled.div<ConfirmationStepProps>((props) => ({
  width: 32,
  height: 4,
  backgroundColor: props.isCompleted ? props.theme.colors.white[0] : props.theme.colors.white[900],
  borderRadius: props.theme.radius(1),
  transition: 'background-color 0.2s ease',
  ':first-child': {
    marginRight: props.theme.spacing(4),
  },
}));

function ConfirmLedgerTransaction(): JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [txId, setTxId] = useState<string | undefined>(undefined);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxApproved, setIsTxApproved] = useState(false);
  const [isFinalTxApproved, setIsFinalTxApproved] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);

  const { t } = useTranslation('translation', { keyPrefix: 'LEDGER_CONFIRM_TRANSACTION_SCREEN' });
  const location = useLocation();
  const selectedNetwork = useNetworkSelector();

  const { network, selectedAccount, ledgerAccountsList } = useWalletSelector();

  const btcClient = useBtcClient();

  const {
    recipients,
    type,
    unsignedTx,
    ordinalUtxo,
  }: {
    amount: BigNumber;
    recipients: Recipient[];
    type: LedgerTransactionType;
    unsignedTx: StacksTransaction;
    ordinalUtxo: any;
  } = location.state;

  const transition = useTransition(currentStepIndex, {
    from: {
      x: 24,
      opacity: 0,
    },
    enter: {
      x: 0,
      opacity: 1,
    },
  });

  const signAndBroadcastOrdinalsTx = async (transport: Transport, accountId: number) => {
    try {
      const result = await signLedgerMixedBtcTransaction(
        transport,
        network.type,
        accountId,
        recipients,
        ordinalUtxo,
      );
      const {value: psbtCreatedValue} = await result.next();

      const {value: taprootSignedValue} = await result.next();
      setIsTxApproved(true);
      setCurrentStepIndex(1.5);

      const {value: txHex} = await result.next();
      setIsFinalTxApproved(true);
      await ledgerDelay(1500);
      const transactionId = await btcClient.sendRawTransaction(txHex || taprootSignedValue);
      setTxId(transactionId.tx.hash);
      setCurrentStepIndex(2);
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
      setIsButtonDisabled(false);
    } finally {
      transport.close();
    }
  };

  const signAndBroadcastBtcTx = async (transport: Transport, accountId: number) => {
    try {
      const result = await signLedgerNativeSegwitBtcTransaction(
        transport,
        network.type,
        accountId,
        recipients,
      );
      setIsFinalTxApproved(true);
      await ledgerDelay(1500);
      const transactionId = await btcClient.sendRawTransaction(result);
      setTxId(transactionId.tx.hash);
      setCurrentStepIndex(2);
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
      setIsButtonDisabled(false);
    } finally {
      transport.close();
    }
  };

  const signAndBroadcastStxTx = async (transport: Transport, accountId: number) => {
    try {
      const result = await signLedgerStxTransaction(transport, unsignedTx, accountId);
      setIsFinalTxApproved(true);
      await ledgerDelay(1500);
      const transactionHash = await broadcastSignedTransaction(result, selectedNetwork);
      setTxId(transactionHash);
      setCurrentStepIndex(2);
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
      setIsButtonDisabled(false);
    } finally {
      transport.close();
    }
  };

  const handleConnectAndConfirm = async () => {
    if (!selectedAccount) {
      console.error('No account selected');
      return;
    }

    try {
      setIsButtonDisabled(true);

      const transport = await Transport.create();
  
      if (!transport) {
        setIsConnectSuccess(false);
        setIsConnectFailed(true);
        setIsButtonDisabled(false);
        return;
      }
  
      const masterFingerPrint = await getMasterFingerPrint(transport);
  
      const deviceAccounts = ledgerAccountsList.filter((account) => account.masterPubKey === masterFingerPrint);
      const accountId = deviceAccounts.findIndex((account) => account.id === selectedAccount.id);
  
      setIsConnectSuccess(true);
      await ledgerDelay(1500);

      if (type === 'ORDINALS' && currentStepIndex !== 0.5 && currentStepIndex !== 1) {
        setCurrentStepIndex(0.5);
        return;
      }
      
      if (currentStepIndex !== 1) {
        setCurrentStepIndex(1);
      }
  
      switch (type) {
        case 'BTC':
        case 'BRC-20':
          await signAndBroadcastBtcTx(transport as Transport, accountId);
          break;
        case 'STX':
          await signAndBroadcastStxTx(transport as Transport, accountId);
          break;
        case 'ORDINALS':
          await signAndBroadcastOrdinalsTx(transport as Transport, accountId);
          break;
        default:
          break;
      }
      await transport.close();
    } catch (err) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const goToConfirmationStep = () => {
    setCurrentStepIndex(1);

    handleConnectAndConfirm();
  }

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setIsConnectFailed(false);
    setIsTxApproved(false);
    setCurrentStepIndex(0);
  };

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  const handleSeeTransaction = () => {
    if (!txId) {
      console.error('No txId found');
      return;
    }

    switch (type) {
      case 'BTC':
      case 'BRC-20':
        window.open(getBtcTxStatusUrl(txId, network), '_blank', 'noopener,noreferrer');
        break;
      case 'STX':
        window.open(getStxTxStatusUrl(txId, network), '_blank', 'noopener,noreferrer');
        break;
      case 'ORDINALS':
        window.open(getBtcTxStatusUrl(txId, network), '_blank', 'noopener,noreferrer');
        break;
      default:
        break;
    }
  };

  const renderLedgerConfirmationView = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <div>
            <LedgerConnectionView
              title={t('CONNECT.TITLE')}
              text={t('CONNECT.BTC_SUBTITLE')}
              titleFailed={t('CONNECT.ERROR_TITLE')}
              textFailed={t('CONNECT.BTC_ERROR_SUBTITLE')}
              imageDefault={ledgerConnectDefaultIcon}
              isConnectSuccess={isConnectSuccess}
              isConnectFailed={isConnectFailed}
            />
          </div>
        );
      case 0.5:
        if (isTxRejected || isConnectFailed) {
          return <LedgerFailView title={t('CONFIRM.ERROR_TITLE')} text={t('CONFIRM.ERROR_SUBTITLE')} />;
        }

        return (
          <div>
            <ConnectLedgerContainer>
              <InfoImage
                src={InfoIcon}
                alt="external inputs warning"
              />
              <ConnectLedgerTitle>{t('EXTERNAL_INPUTS.TITLE')}</ConnectLedgerTitle>
              <ConnectLedgerText>{t('EXTERNAL_INPUTS.SUBTITLE')}</ConnectLedgerText>
            </ConnectLedgerContainer>
          </div>
        );
      case 1:
        if (type === 'ORDINALS') {
          if (isTxRejected || isConnectFailed) {
            return <LedgerFailView title={t('CONFIRM.ERROR_TITLE')} text={t('CONFIRM.ERROR_SUBTITLE')} />;
          }

          return (
            <ConnectLedgerContainer>
              <img
                src={ledgerConfirmOrdinalsIcon}
                alt="confirm ordinal transfer tx on the ledger device"
              />
              <ConnectLedgerTitle>{t('CONFIRM.TITLE')}</ConnectLedgerTitle>
              <ConnectLedgerTextAdvanced isCompleted={isTxApproved}>Confirm the Ordinal inscription transfer on your device.</ConnectLedgerTextAdvanced>
              <ConfirmationStepsContainer>
                <ConfirmationStep isCompleted={isTxApproved} />
                <ConfirmationStep isCompleted={isFinalTxApproved} />
              </ConfirmationStepsContainer>
              <div />
            </ConnectLedgerContainer>
          );
        }

        return (
          <div>
            <LedgerConnectionView
              title={t('CONFIRM.TITLE')}
              text={t('CONFIRM.SUBTITLE')}
              titleFailed={t('CONFIRM.ERROR_TITLE')}
              textFailed={t('CONFIRM.ERROR_SUBTITLE')}
              imageDefault={ledgerConnectDefaultIcon}
              isConnectSuccess={isFinalTxApproved}
              isConnectFailed={isTxRejected}
            />
          </div>
        );
      case 1.5:
        if (type === 'ORDINALS') {
          if (isTxRejected || isConnectFailed) {
            return <LedgerFailView title={t('CONFIRM.ERROR_TITLE')} text={t('CONFIRM.ERROR_SUBTITLE')} />;
          }

          return (
            <ConnectLedgerContainer>
              <img
                src={ledgerConfirmBtcIcon}
                alt="confirm btc fee tx on the ledger device"
              />
              <ConnectLedgerTitle>{t('CONFIRM.TITLE')}</ConnectLedgerTitle>
              <ConnectLedgerTextAdvanced isCompleted={isFinalTxApproved}>Confirm the payment of transaction fees from the Bitcoin payment address on your device.</ConnectLedgerTextAdvanced>
              <ConfirmationStepsContainer>
                <ConfirmationStep isCompleted={isTxApproved} />
                <ConfirmationStep isCompleted={isFinalTxApproved} />
              </ConfirmationStepsContainer>
              <div />
            </ConnectLedgerContainer>
          );
        }
        return null;
      case 2:
        return (
          <TxConfirmedContainer>
            <img src={CheckCircleSVG} alt="Success" />
            <TxConfirmedTitle>{t('SUCCESS.TITLE')}</TxConfirmedTitle>
            <TxConfirmedDescription>{t('SUCCESS.SUBTITLE')}</TxConfirmedDescription>
            {type === 'BRC-20' && (
              <InfoContainerWrapper>
                <InfoContainer bodyText="The inscription may take up to several hours to appear in your wallet. Once received, head to your collectible dashboard and send it to your recipient to complete the token transfer." />
              </InfoContainerWrapper>
            )}
          </TxConfirmedContainer>
        );
      default:
        return null;
    }
  };

  const renderLedgerConfirmationControls = () => {
    switch (currentStepIndex) {
      case 0.5:
        if (isTxRejected || isConnectFailed) {
          return (
            <SuccessActionsContainer>
              <ActionButton
                onPress={handleRetry}
                text={t('RETRY_BUTTON')}
                disabled={isButtonDisabled}
                processing={isButtonDisabled}
              />
              <ActionButton
                transparent
                onPress={handleClose}
                text={t('CANCEL_BUTTON')}
                disabled={isButtonDisabled}
              />
            </SuccessActionsContainer>
          );
        }

        return (
          <SuccessActionsContainer>
            <ActionButton
              onPress={goToConfirmationStep}
              text={t('CONTINUE_BUTTON')}
            />
          </SuccessActionsContainer>
        );
      case 1:
      case 1.5:
        if (type === 'ORDINALS' && !isTxRejected && !isConnectFailed) {
          return (
            <SuccessActionsContainer>
              <ActionButton
                transparent
                onPress={handleClose}
                text={t('CANCEL_BUTTON')}
              />
            </SuccessActionsContainer>
          );
        }

        return (
          <SuccessActionsContainer>
            <ActionButton
              onPress={(isTxRejected || isConnectFailed) ? handleRetry : handleConnectAndConfirm}
              text={t((isTxRejected || isConnectFailed) ? 'RETRY_BUTTON' : 'CONNECT_BUTTON')}
              disabled={isButtonDisabled}
              processing={isButtonDisabled}
            />
            <ActionButton
              transparent
              onPress={handleClose}
              text={t('CANCEL_BUTTON')}
              disabled={isButtonDisabled}
            />
          </SuccessActionsContainer>
        );
      case 2:
        return (
          <SuccessActionsContainer>
            <ActionButton onPress={handleClose} text={t('CLOSE_BUTTON')} />
            <ActionButton
              transparent
              onPress={handleSeeTransaction}
              text={t('SEE_TRANSACTION_BUTTON')}
            />
          </SuccessActionsContainer>
        );
      default:
        return (
          <SuccessActionsContainer>
            <ActionButton
              onPress={(isTxRejected || isConnectFailed) ? handleRetry : handleConnectAndConfirm}
              text={t((isTxRejected || isConnectFailed) ? 'RETRY_BUTTON' : 'CONNECT_BUTTON')}
              disabled={isButtonDisabled}
              processing={isButtonDisabled}
            />
            <ActionButton
              transparent
              onPress={handleClose}
              text={t('CANCEL_BUTTON')}
              disabled={isButtonDisabled}
            />
          </SuccessActionsContainer>
        );
    }
  };

  return (
    <Container>
      <FullScreenHeader />
      {transition((style) => (
        <>
          <OnBoardingContentContainer style={style}>
            {renderLedgerConfirmationView()}
          </OnBoardingContentContainer>
          {renderLedgerConfirmationControls()}
        </>
      ))}
    </Container>
  );
}

export default ConfirmLedgerTransaction;
