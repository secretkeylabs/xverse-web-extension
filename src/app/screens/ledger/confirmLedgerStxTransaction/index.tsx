import checkCircleIcon from '@assets/img/hw/ledger/check_circle.svg';
import ledgerConnectDefaultIcon from '@assets/img/hw/ledger/ledger_connect_default.svg';
import ledgerConnectStxIcon from '@assets/img/hw/ledger/ledger_import_connect_stx.svg';
import { delay } from '@common/utils/promises';
import ActionButton from '@components/button';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { useTransition } from '@react-spring/web';
import {
  broadcastSignedTransaction,
  microstacksToStx,
  signLedgerStxTransaction,
  type StacksRecipient,
} from '@secretkeylabs/xverse-core';
import { DEFAULT_TRANSITION_OPTIONS } from '@utils/constants';
import { getStxTxStatusUrl, getTruncatedAddress } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { sendInternalErrorMessage } from '@common/utils/rpc/responseMessages/errors';
import {
  sendSignTransactionSuccessResponseMessage,
  sendStxTransferSuccessResponseMessage,
} from '@common/utils/rpc/responseMessages/stacks';
import useSelectedAccount from '@hooks/useSelectedAccount';
import {
  Container,
  OnBoardingContentContainer,
  RecipientsWrapper,
  SuccessActionsContainer,
  TxConfirmedContainer,
  TxConfirmedDescription,
  TxConfirmedTitle,
  TxDetails,
  TxDetailsRow,
  TxDetailsTitle,
} from './index.styled';

enum Steps {
  ConnectLedger = 0,
  ConfirmTransaction = 1,
  TransactionConfirmed = 2,
}

function ConfirmLedgerStxTransaction(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(Steps.ConnectLedger);
  const [txId, setTxId] = useState<string | undefined>(undefined);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isWrongDevice, setIsWrongDevice] = useState(false);
  const [isFinalTxApproved, setIsFinalTxApproved] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);

  const { t } = useTranslation('translation', { keyPrefix: 'LEDGER_CONFIRM_TRANSACTION_SCREEN' });
  const location = useLocation();
  const selectedNetwork = useNetworkSelector();

  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();

  const {
    recipients,
    unsignedTx,
    fee,
    tabId,
    messageId,
    rpcMethod,
  }: {
    amount: BigNumber;
    recipients: StacksRecipient[];
    unsignedTx: Buffer;
    fee?: BigNumber;
    messageId?: string;
    tabId?: number;
    rpcMethod: string;
  } = location.state;

  const transition = useTransition(currentStep, DEFAULT_TRANSITION_OPTIONS);

  const signAndBroadcastStxTx = async (transport: Transport, addressIndex: number) => {
    try {
      const result = await signLedgerStxTransaction({
        transport,
        transactionBuffer: unsignedTx,
        addressIndex,
      });
      setIsFinalTxApproved(true);
      await delay(1500);
      const transactionHash = result.serialize();
      const broadcastedTxId = await broadcastSignedTransaction(result, selectedNetwork);
      setTxId(broadcastedTxId);
      switch (rpcMethod) {
        case 'stx_signTransaction': {
          sendSignTransactionSuccessResponseMessage({
            tabId: tabId ?? 0,
            messageId,
            result: { transaction: transactionHash },
          });
          break;
        }
        case 'stx_transferStx': {
          sendStxTransferSuccessResponseMessage({
            tabId: tabId ?? 0,
            messageId,
            result: { transaction: transactionHash, txid: broadcastedTxId },
          });
          break;
        }
        default: {
          sendInternalErrorMessage({ tabId: tabId ?? 0, messageId });
        }
      }
      setCurrentStep(Steps.TransactionConfirmed);
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

      const addressIndex = selectedAccount.deviceAccountIndex;

      if (addressIndex === undefined) {
        setIsConnectSuccess(false);
        setIsConnectFailed(true);
        setIsWrongDevice(true);
        setIsButtonDisabled(false);
        return;
      }

      setIsConnectSuccess(true);
      await delay(1500);

      if (currentStep !== Steps.ConfirmTransaction) {
        setCurrentStep(Steps.ConfirmTransaction);
      }

      await signAndBroadcastStxTx(transport as Transport, addressIndex);
      await transport.close();
    } catch (err) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setIsConnectFailed(false);
    setIsWrongDevice(false);
    setCurrentStep(Steps.ConnectLedger);
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

    window.open(getStxTxStatusUrl(txId, network), '_blank', 'noopener,noreferrer');
  };

  const renderTxDetails = () => (
    <TxDetails>
      <TxDetailsRow>
        <TxDetailsTitle>Recipient{recipients.length > 1 ? 's' : ''}</TxDetailsTitle>
        <RecipientsWrapper>
          {recipients.map((recipient) => (
            <div key={recipient.address}>{getTruncatedAddress(recipient.address)}</div>
          ))}
        </RecipientsWrapper>
      </TxDetailsRow>
      <TxDetailsRow>
        <TxDetailsTitle>{t('AMOUNT')}</TxDetailsTitle>
        <div>
          {microstacksToStx((recipients[0] as StacksRecipient).amountMicrostacks).toString()} STX
        </div>
      </TxDetailsRow>
      {fee && (
        <TxDetailsRow>
          <TxDetailsTitle>{t('FEES')}</TxDetailsTitle>
          <div>{microstacksToStx(fee).toString()} STX</div>
        </TxDetailsRow>
      )}
    </TxDetails>
  );

  const renderLedgerConfirmationView = () => {
    switch (currentStep) {
      case Steps.ConnectLedger:
        return (
          <div>
            <LedgerConnectionView
              title={t('CONNECT.TITLE')}
              text={t('CONNECT.STX_SUBTITLE')}
              titleFailed={t('CONNECT.ERROR_TITLE')}
              textFailed={t(
                isWrongDevice
                  ? 'CONNECT.WRONG_DEVICE_ERROR_SUBTITLE'
                  : 'CONNECT.STX_ERROR_SUBTITLE',
              )}
              imageDefault={ledgerConnectStxIcon}
              isConnectSuccess={isConnectSuccess}
              isConnectFailed={isConnectFailed}
            />
          </div>
        );
      case Steps.ConfirmTransaction:
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
            {renderTxDetails()}
          </div>
        );
      case Steps.TransactionConfirmed:
        return (
          <TxConfirmedContainer>
            <img src={checkCircleIcon} alt="Success" />
            <TxConfirmedTitle>{t('SUCCESS.TITLE')}</TxConfirmedTitle>
            <TxConfirmedDescription>{t('SUCCESS.SUBTITLE')}</TxConfirmedDescription>
          </TxConfirmedContainer>
        );
      default:
        return null;
    }
  };

  const renderLedgerConfirmationControls = () => {
    switch (currentStep) {
      case Steps.ConfirmTransaction:
        return (
          <SuccessActionsContainer>
            <ActionButton
              onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
              text={t(isTxRejected || isConnectFailed ? 'RETRY_BUTTON' : 'CONNECT_BUTTON')}
              disabled={isButtonDisabled}
              processing={isButtonDisabled}
            />
            <ActionButton
              transparent
              onPress={handleClose}
              text={t(isTxRejected || isConnectFailed ? 'CLOSE_BUTTON' : 'CANCEL_BUTTON')}
              disabled={isButtonDisabled}
            />
          </SuccessActionsContainer>
        );
      case Steps.TransactionConfirmed:
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
              onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
              text={t(isTxRejected || isConnectFailed ? 'RETRY_BUTTON' : 'CONNECT_BUTTON')}
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

export default ConfirmLedgerStxTransaction;
