import { delay } from '@common/utils/promises';
import TransportFactory from '@ledgerhq/hw-transport-webusb';
import { type LedgerTransport } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import LedgerStepView, { Steps } from './ledgerStepView';

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

type Props = {
  onConfirm: (options: { ledgerTransport: LedgerTransport }) => void;
  onCancel: () => void;
  txnToSignCount?: number;
  txnSignIndex?: number;
  showExternalInputsWarning?: boolean;
};

function LedgerSteps({
  onConfirm,
  onCancel,
  txnToSignCount,
  txnSignIndex,
  showExternalInputsWarning = false,
}: Props) {
  const [currentStep, setCurrentStep] = useState(Steps.ConnectLedger);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);

  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });

  const handleConnectAndConfirm = async () => {
    setIsButtonDisabled(true);

    const ledgerTransport = await TransportFactory.create();

    if (!ledgerTransport) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
      return;
    }

    setIsConnectSuccess(true);
    await delay(1500);

    if (
      currentStep !== Steps.ExternalInputs &&
      currentStep !== Steps.ConfirmTransaction &&
      showExternalInputsWarning
    ) {
      setCurrentStep(Steps.ExternalInputs);
      return;
    }

    if (currentStep !== Steps.ConfirmTransaction) {
      setCurrentStep(Steps.ConfirmTransaction);
    }

    try {
      onConfirm({ ledgerTransport });
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
    }
  };

  const goToConfirmationStep = () => {
    setCurrentStep(Steps.ConfirmTransaction);

    handleConnectAndConfirm();
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setCurrentStep(Steps.ConnectLedger);
  };

  return (
    <>
      <LedgerStepView
        currentStep={currentStep}
        isConnectSuccess={isConnectSuccess}
        isConnectFailed={isConnectFailed}
        isTxRejected={isTxRejected}
        t={t}
        signatureRequestTranslate={signatureRequestTranslate}
        txnToSignCount={txnToSignCount}
        txnSignIndex={txnSignIndex}
      />
      <SuccessActionsContainer>
        {currentStep === Steps.ExternalInputs && !isTxRejected && !isConnectFailed ? (
          <Button onClick={goToConfirmationStep} title={t('LEDGER.CONTINUE_BUTTON')} />
        ) : (
          <>
            <Button
              onClick={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
              title={signatureRequestTranslate(
                isTxRejected || isConnectFailed ? 'LEDGER.RETRY_BUTTON' : 'LEDGER.CONNECT_BUTTON',
              )}
              disabled={isButtonDisabled}
              loading={isButtonDisabled}
            />
            <Button
              onClick={onCancel}
              title={signatureRequestTranslate('LEDGER.CANCEL_BUTTON')}
              variant="secondary"
            />
          </>
        )}
      </SuccessActionsContainer>
    </>
  );
}

export default LedgerSteps;
