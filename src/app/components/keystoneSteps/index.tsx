import { delay } from '@common/utils/promises';
import { createKeystoneTransport, TransportWebUSB } from '@keystonehq/hw-transport-webusb';
import Button from '@ui-library/button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import KeystoneStepView, { Steps } from './keystoneStepView';

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
  onConfirm: (options: { keystoneTransport?: TransportWebUSB }) => void;
  onCancel: () => void;
  txnToSignCount?: number;
  txnSignIndex?: number;
};

function KeystoneSteps({ onConfirm, onCancel, txnToSignCount, txnSignIndex }: Props) {
  const [currentStep, setCurrentStep] = useState(Steps.ConnectKeystone);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);

  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });

  const handleConnectAndConfirm = async () => {
    setIsButtonDisabled(true);

    const keystoneTransport = await createKeystoneTransport();

    if (!keystoneTransport) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
      return;
    }
    setCurrentStep(Steps.ConnectKeystone);

    await delay(1500);

    setCurrentStep(Steps.ConfirmTransaction);

    try {
      onConfirm({ keystoneTransport });
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
    }
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setCurrentStep(Steps.ConnectKeystone);
  };

  return (
    <>
      <KeystoneStepView
        currentStep={currentStep}
        isConnectSuccess={isConnectSuccess}
        isConnectFailed={isConnectFailed}
        isTxRejected={isTxRejected}
        signatureRequestTranslate={signatureRequestTranslate}
        txnToSignCount={txnToSignCount}
        txnSignIndex={txnSignIndex}
      />
      <SuccessActionsContainer>
        <Button
          onClick={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
          title={signatureRequestTranslate(
            isTxRejected || isConnectFailed ? 'KEYSTONE.RETRY_BUTTON' : 'KEYSTONE.CONNECT_BUTTON',
          )}
          disabled={isButtonDisabled}
          loading={isButtonDisabled}
        />
        <Button
          onClick={onCancel}
          title={signatureRequestTranslate('KEYSTONE.CANCEL_BUTTON')}
          variant="secondary"
        />
      </SuccessActionsContainer>
    </>
  );
}

export default KeystoneSteps;
