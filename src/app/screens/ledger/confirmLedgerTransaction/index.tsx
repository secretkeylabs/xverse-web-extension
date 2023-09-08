import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useTransition } from '@react-spring/web';
import Transport from '@ledgerhq/hw-transport-webusb';
import ActionButton from '@components/button';
import {
  broadcastSignedTransaction,
  signLedgerNativeSegwitBtcTransaction,
  signLedgerStxTransaction,
  signLedgerMixedBtcTransaction,
  satsToBtc,
  microstacksToStx,
} from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import useWalletSelector from '@hooks/useWalletSelector';
import { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import { StacksRecipient } from '@secretkeylabs/xverse-core/transactions/stx';
import LedgerConnectionView, {
  ConnectLedgerContainer,
  ConnectLedgerText,
} from '@components/ledger/connectLedgerView';
import { ledgerDelay } from '@common/utils/ledger';
import { getBtcTxStatusUrl, getStxTxStatusUrl, getTruncatedAddress } from '@utils/helper';
import FullScreenHeader from '@components/ledger/fullScreenHeader';
import useBtcClient from '@hooks/useBtcClient';
import useNetworkSelector from '@hooks/useNetwork';
import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectStxIcon from '@assets/img/ledger/ledger_import_connect_stx.svg';
import ledgerConfirmBtcIcon from '@assets/img/ledger/btc_icon.svg';
import ledgerConfirmOrdinalsIcon from '@assets/img/ledger/ordinals_icon_big.svg';
import checkCircleIcon from '@assets/img/ledger/check_circle.svg';
import InfoIcon from '@assets/img/info.svg';
import InfoContainer from '@components/infoContainer';
import LedgerFailView from '@components/ledger/failLedgerView';
import { UTXO } from '@secretkeylabs/xverse-core/types';
import Stepper from '@components/stepper';
import { LedgerTransactionType } from '@common/types/ledger';

import {
  Container,
  OnBoardingContentContainer,
  RecipientsWrapper,
  ConfirmTxIconBig,
  TxDetails,
  TxDetailsRow,
  TxDetailsTitle,
  ConnectLedgerTitle,
  ConnectLedgerTextAdvanced,
  InfoImage,
  SuccessActionsContainer,
  TxConfirmedContainer,
  TxConfirmedTitle,
  TxConfirmedDescription,
  InfoContainerWrapper,
} from './index.styled';

enum Steps {
  ConnectLedger = 0,
  ExternalInputs = 0.5,
  ConfirmTransaction = 1,
  ConfirmFees = 1.5,
  TransactionConfirmed = 2,
}

function ConfirmLedgerTransaction(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(Steps.ConnectLedger);
  const [txId, setTxId] = useState<string | undefined>(undefined);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isWrongDevice, setIsWrongDevice] = useState(false);
  const [isTxApproved, setIsTxApproved] = useState(false);
  const [isFinalTxApproved, setIsFinalTxApproved] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);

  const { t } = useTranslation('translation', { keyPrefix: 'LEDGER_CONFIRM_TRANSACTION_SCREEN' });
  const location = useLocation();
  const selectedNetwork = useNetworkSelector();

  const { network, selectedAccount } = useWalletSelector();

  const btcClient = useBtcClient();

  const {
    recipients,
    type,
    unsignedTx,
    ordinalUtxo,
    feeRateInput,
    fee,
  }: {
    amount: BigNumber;
    recipients: Recipient[] | StacksRecipient[];
    type: LedgerTransactionType;
    unsignedTx: Buffer;
    ordinalUtxo?: UTXO;
    feeRateInput?: string;
    fee?: BigNumber;
  } = location.state;

  const transition = useTransition(currentStep, {
    from: {
      x: 24,
      opacity: 0,
    },
    enter: {
      x: 0,
      opacity: 1,
    },
  });

  const signAndBroadcastOrdinalsTx = async (transport: Transport, addressIndex: number) => {
    try {
      const result = await signLedgerMixedBtcTransaction({
        transport,
        network: network.type,
        addressIndex,
        recipients: recipients as Recipient[],
        feeRate: feeRateInput?.toString(),
        ordinalUtxo,
      });
      const { value: psbtCreatedValue } = await result.next();

      const { value: taprootSignedValue } = await result.next();
      setIsTxApproved(true);
      setCurrentStep(Steps.ConfirmFees);

      const { value: txHex } = await result.next();
      setIsFinalTxApproved(true);
      await ledgerDelay(1500);
      const transactionId = await btcClient.sendRawTransaction(txHex || taprootSignedValue);
      setTxId(transactionId.tx.hash);
      setCurrentStep(Steps.TransactionConfirmed);
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
      setIsButtonDisabled(false);
    } finally {
      transport.close();
    }
  };

  const signAndBroadcastBtcTx = async (transport: Transport, addressIndex: number) => {
    try {
      const result = await signLedgerNativeSegwitBtcTransaction({
        transport,
        network: network.type,
        addressIndex,
        recipients: recipients as Recipient[],
        feeRate: feeRateInput?.toString(),
      });
      setIsFinalTxApproved(true);
      await ledgerDelay(1500);
      const transactionId = await btcClient.sendRawTransaction(result);
      setTxId(transactionId.tx.hash);
      setCurrentStep(Steps.TransactionConfirmed);
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
      setIsButtonDisabled(false);
    } finally {
      transport.close();
    }
  };

  const signAndBroadcastStxTx = async (transport: Transport, addressIndex: number) => {
    try {
      const result = await signLedgerStxTransaction({
        transport,
        transactionBuffer: unsignedTx,
        addressIndex,
      });
      setIsFinalTxApproved(true);
      await ledgerDelay(1500);
      const transactionHash = await broadcastSignedTransaction(result, selectedNetwork);
      setTxId(transactionHash);
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
      await ledgerDelay(1500);

      if (
        type === 'ORDINALS' &&
        currentStep !== Steps.ExternalInputs &&
        currentStep !== Steps.ConfirmTransaction
      ) {
        setCurrentStep(Steps.ExternalInputs);
        return;
      }

      if (currentStep !== Steps.ConfirmTransaction) {
        setCurrentStep(Steps.ConfirmTransaction);
      }

      switch (type) {
        case 'BTC':
        case 'BRC-20':
          await signAndBroadcastBtcTx(transport as Transport, addressIndex);
          break;
        case 'STX':
          await signAndBroadcastStxTx(transport as Transport, addressIndex);
          break;
        case 'ORDINALS':
          await signAndBroadcastOrdinalsTx(transport as Transport, addressIndex);
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
    setCurrentStep(Steps.ConfirmTransaction);

    handleConnectAndConfirm();
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setIsConnectFailed(false);
    setIsWrongDevice(false);
    setIsTxApproved(false);
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
        <TxDetailsTitle>{ordinalUtxo?.value ? 'Ordinal value' : 'Amount'}</TxDetailsTitle>
        {type === 'STX' ? (
          <div>
            {microstacksToStx((recipients[0] as StacksRecipient).amountMicrostacks).toString()} STX
          </div>
        ) : (
          <div>
            {ordinalUtxo?.value
              ? satsToBtc(new BigNumber(ordinalUtxo?.value)).toString()
              : satsToBtc((recipients[0] as Recipient).amountSats).toString()}{' '}
            BTC
          </div>
        )}
      </TxDetailsRow>
      {fee && (
        <TxDetailsRow>
          <TxDetailsTitle>{t('FEES')}</TxDetailsTitle>
          {type === 'STX' ? (
            <div>{microstacksToStx(fee).toString()} STX</div>
          ) : (
            <div>{satsToBtc(fee).toString()} BTC</div>
          )}
        </TxDetailsRow>
      )}
    </TxDetails>
  );

  const renderOrdinalTxDetails = () => (
    <>
      <Stepper
        steps={[
          { title: t('SEND_ORDINAL'), isCompleted: isTxApproved },
          { title: t('CONFIRM_FEES'), isCompleted: isFinalTxApproved },
        ]}
      />
      {renderTxDetails()}
    </>
  );

  const connectErrSubtitle =
    type === 'STX' ? 'CONNECT.STX_ERROR_SUBTITLE' : 'CONNECT.BTC_ERROR_SUBTITLE';

  const renderLedgerConfirmationView = () => {
    switch (currentStep) {
      case Steps.ConnectLedger:
        return (
          <div>
            <LedgerConnectionView
              title={t('CONNECT.TITLE')}
              text={t(type === 'STX' ? 'CONNECT.STX_SUBTITLE' : 'CONNECT.BTC_SUBTITLE')}
              titleFailed={t('CONNECT.ERROR_TITLE')}
              textFailed={t(
                isWrongDevice ? 'CONNECT.WRONG_DEVICE_ERROR_SUBTITLE' : connectErrSubtitle,
              )}
              imageDefault={type === 'STX' ? ledgerConnectStxIcon : ledgerConfirmBtcIcon}
              isConnectSuccess={isConnectSuccess}
              isConnectFailed={isConnectFailed}
            />
          </div>
        );
      case Steps.ExternalInputs:
        if (isTxRejected || isConnectFailed) {
          return (
            <LedgerFailView title={t('CONFIRM.ERROR_TITLE')} text={t('CONFIRM.ERROR_SUBTITLE')} />
          );
        }

        return (
          <div>
            <ConnectLedgerContainer>
              <InfoImage src={InfoIcon} alt="external inputs warning" />
              <ConnectLedgerTitle>{t('EXTERNAL_INPUTS.TITLE')}</ConnectLedgerTitle>
              <ConnectLedgerText>{t('EXTERNAL_INPUTS.SUBTITLE')}</ConnectLedgerText>
            </ConnectLedgerContainer>
          </div>
        );
      case Steps.ConfirmTransaction:
        if (type === 'ORDINALS') {
          if (isTxRejected || isConnectFailed) {
            return (
              <LedgerFailView title={t('CONFIRM.ERROR_TITLE')} text={t('CONFIRM.ERROR_SUBTITLE')} />
            );
          }

          return (
            <ConnectLedgerContainer>
              <ConfirmTxIconBig
                src={ledgerConfirmOrdinalsIcon}
                alt="confirm ordinal transfer tx on the ledger device"
              />
              <ConnectLedgerTitle>{t('CONFIRM.ORDINAL_TX.ORDINAL_TITLE')}</ConnectLedgerTitle>
              <ConnectLedgerTextAdvanced isCompleted={isTxApproved}>
                {t('CONFIRM.ORDINAL_TX.ORDINAL_SUBTITLE')}
              </ConnectLedgerTextAdvanced>
              {renderOrdinalTxDetails()}
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
            {renderTxDetails()}
          </div>
        );
      case Steps.ConfirmFees:
        if (type === 'ORDINALS') {
          if (isTxRejected || isConnectFailed) {
            return (
              <LedgerFailView title={t('CONFIRM.ERROR_TITLE')} text={t('CONFIRM.ERROR_SUBTITLE')} />
            );
          }

          return (
            <ConnectLedgerContainer>
              <ConfirmTxIconBig
                src={ledgerConfirmBtcIcon}
                alt="confirm btc fee tx on the ledger device"
              />
              <ConnectLedgerTitle>{t('CONFIRM.TITLE')}</ConnectLedgerTitle>
              <ConnectLedgerTextAdvanced isCompleted={isFinalTxApproved}>
                {t('CONFIRM.ORDINAL_TX.BTC_SUBTITLE')}
              </ConnectLedgerTextAdvanced>
              {renderOrdinalTxDetails()}
              <div />
            </ConnectLedgerContainer>
          );
        }
        return null;
      case Steps.TransactionConfirmed:
        return (
          <TxConfirmedContainer>
            <img src={checkCircleIcon} alt="Success" />
            <TxConfirmedTitle>{t('SUCCESS.TITLE')}</TxConfirmedTitle>
            <TxConfirmedDescription>{t('SUCCESS.SUBTITLE')}</TxConfirmedDescription>
            {type === 'BRC-20' && (
              <InfoContainerWrapper>
                <InfoContainer bodyText={t('SUCCESS.BRC20_INFO')} />
              </InfoContainerWrapper>
            )}
          </TxConfirmedContainer>
        );
      default:
        return null;
    }
  };

  const renderLedgerConfirmationControls = () => {
    switch (currentStep) {
      case Steps.ExternalInputs:
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
                text={t('CLOSE_BUTTON')}
                disabled={isButtonDisabled}
              />
            </SuccessActionsContainer>
          );
        }

        return (
          <SuccessActionsContainer>
            <ActionButton onPress={goToConfirmationStep} text={t('CONTINUE_BUTTON')} />
          </SuccessActionsContainer>
        );
      case Steps.ConfirmTransaction:
      case Steps.ConfirmFees:
        if (type === 'ORDINALS' && !isTxRejected && !isConnectFailed) {
          return (
            <SuccessActionsContainer>
              <ActionButton transparent onPress={handleClose} text={t('CANCEL_BUTTON')} />
            </SuccessActionsContainer>
          );
        }

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
