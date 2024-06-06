import { LoadingTransactionStatus } from '@components/loadingTransactionStatus';
import { ConfirmationStatus } from '@components/loadingTransactionStatus/circularSvgAnimation';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import TransportFactory from '@ledgerhq/hw-transport-webusb';
import {
  BRC20ErrorCode,
  ExecuteTransferProgressCodes,
  useBrc20TransferExecute,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Sheet from '@ui-library/sheet';
import { ExecuteBrc20TransferState } from '@utils/brc20';
import { getBtcTxStatusUrl, isInOptions, isLedgerAccount } from '@utils/helper';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import LedgerStepView from './ledgerStepView';

const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  marginBottom: props.theme.space.xxl,
  marginTop: props.theme.space.xxl,
}));

const AMOUNT_OF_STEPS = Object.keys(ExecuteTransferProgressCodes).length + 1;
const PERCENTAGE_PER_STEP = 1 / AMOUNT_OF_STEPS;

function ExecuteBrc20Transaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'EXECUTE_BRC20' });
  const { network, selectedAccount } = useWalletSelector();
  const navigate = useNavigate();
  const { recipientAddress, estimateFeesParams }: ExecuteBrc20TransferState = useLocation().state;
  const transactionContext = useTransactionContext();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);

  const { progress, complete, executeTransfer, transferTransactionId, errorCode } =
    useBrc20TransferExecute({
      ...estimateFeesParams,
      recipientAddress,
      context: transactionContext,
    });

  const isLedger = isLedgerAccount(selectedAccount);
  const isLedgerModalVisible =
    isLedger &&
    (!isConnectSuccess ||
      progress === ExecuteTransferProgressCodes.CreatingCommitTransaction ||
      progress === ExecuteTransferProgressCodes.CreatingTransferTransaction) &&
    (!errorCode ||
      errorCode === BRC20ErrorCode.DEVICE_LOCKED ||
      errorCode === BRC20ErrorCode.GENERAL_LEDGER_ERROR);

  // general ledger error is handled by the modal
  const showBody =
    !isLedger ||
    (errorCode !== BRC20ErrorCode.GENERAL_LEDGER_ERROR &&
      errorCode !== BRC20ErrorCode.DEVICE_LOCKED);

  const [loadingPercentage, setLoadingPercentage] = useState(0);

  useEffect(() => {
    if (isLedger) return;
    executeTransfer();
  }, [executeTransfer, isLedger]);

  useEffect(() => {
    if (!progress) {
      return;
    }
    setLoadingPercentage((prevProgress) => prevProgress + PERCENTAGE_PER_STEP);
  }, [progress]);

  let confirmationStatus: ConfirmationStatus = 'LOADING';
  if (complete || errorCode) {
    confirmationStatus = complete ? 'SUCCESS' : 'FAILURE';
  }

  /* callbacks */
  const handleClickClose = () => {
    if (isInOptions()) {
      window.close();
    }
    navigate('/');
  };

  const handleClickSeeTransaction = () => {
    if (transferTransactionId) {
      window.open(
        getBtcTxStatusUrl(transferTransactionId, network),
        '_blank',
        'noopener,noreferrer',
      );
    }
  };

  const handleLedgerConnect = async () => {
    try {
      setIsConnecting(true);
      const ledgerTransport = await TransportFactory.create();

      if (!ledgerTransport) {
        setIsConnectSuccess(false);
        setIsConnectFailed(true);
        return;
      }

      setIsConnectSuccess(true);

      executeTransfer({ ledgerTransport });
    } catch (error) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const resultTexts = {
    SUCCESS: {
      title: t('TRANSACTION_HEADLINE', { status: 'Broadcasted' }),
      description: t('YOUR_TRANSACTION_HAS_BEEN'),
    },
    FAILURE: {
      title: t('TRANSACTION_HEADLINE', { status: 'Failed' }),
      description: (
        <>
          {t('XVERSE_WALLET_ROUTER')}
          <br />
          {errorCode}
        </>
      ),
    },
  }[confirmationStatus];

  const loadingPercentageAwareOfStatus =
    confirmationStatus !== 'LOADING' && !isLedgerModalVisible ? 1 : loadingPercentage;

  return (
    <>
      {showBody && (
        <LoadingTransactionStatus
          status={confirmationStatus}
          resultTexts={resultTexts}
          loadingTexts={{
            title: t('BROADCASTING_YOUR'),
            description: t('DO_NOT_CLOSE'),
          }}
          primaryAction={{ onPress: handleClickClose, text: t('CLOSE') }}
          secondaryAction={{
            onPress: handleClickSeeTransaction,
            text: t('SEE_YOUR_TRANSACTION'),
          }}
          loadingPercentage={loadingPercentageAwareOfStatus}
        />
      )}
      <Sheet title="" visible={isLedgerModalVisible} onClose={handleClickClose}>
        <LedgerStepView
          currentStep={progress}
          isConnectSuccess={isConnectSuccess}
          isConnectFailed={isConnectFailed || !!errorCode}
          isDeviceLocked={errorCode === BRC20ErrorCode.DEVICE_LOCKED}
        />
        <SuccessActionsContainer>
          {(!isConnectSuccess || errorCode === BRC20ErrorCode.DEVICE_LOCKED) && (
            <Button
              onClick={handleLedgerConnect}
              title={t(isConnectFailed ? 'LEDGER.RETRY_BUTTON' : 'LEDGER.CONNECT_BUTTON')}
              disabled={isConnecting}
              loading={isConnecting}
            />
          )}
          <Button onClick={handleClickClose} title={t('LEDGER.CANCEL_BUTTON')} variant="tertiary" />
        </SuccessActionsContainer>
      </Sheet>
    </>
  );
}
export default ExecuteBrc20Transaction;
