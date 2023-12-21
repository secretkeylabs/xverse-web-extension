import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/ledger/ledger_import_connect_btc.svg';
import { delay } from '@common/utils/ledger';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import useWalletSelector from '@hooks/useWalletSelector';
import TransportFactory from '@ledgerhq/hw-transport-webusb';
import { btcTransaction, Transport } from '@secretkeylabs/xverse-core';
import Callout from '@ui-library/callout';
import { StickyHorizontalSplitButtonContainer, StyledP } from '@ui-library/common.styled';
import { isLedgerAccount } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';
import SendLayout from '../../layouts/sendLayout';
import TransactionSummary from './transactionSummary';

const LoaderContainer = styled.div(() => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}));

const ReviewTransactionText = styled(StyledP)`
  text-align: left;
  margin-bottom: ${(props) => props.theme.space.l};
`;

const BroadcastCallout = styled(Callout)`
  margin-bottom: ${(props) => props.theme.space.m};
`;

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
  inputs: btcTransaction.EnhancedInput[];
  outputs: btcTransaction.EnhancedOutput[];
  feeOutput?: btcTransaction.TransactionFeeOutput;
  isLoading: boolean;
  isSubmitting: boolean;
  isBroadcast?: boolean;
  isError?: boolean;
  showAccountHeader?: boolean;
  hideBottomBar?: boolean;
  cancelText: string;
  confirmText: string;
  onConfirm: (ledgerTransport?: Transport) => void;
  onCancel: () => void;
  onBackClick?: () => void;
  confirmDisabled?: boolean;
  getFeeForFeeRate?: (feeRate: number, useEffectiveFeeRate?: boolean) => Promise<number>;
  onFeeRateSet?: (feeRate: number) => void;
};

function ConfirmBtcTransaction({
  inputs,
  outputs,
  feeOutput,
  isLoading,
  isSubmitting,
  isBroadcast,
  isError = false,
  cancelText,
  confirmText,
  onConfirm,
  onCancel,
  onBackClick,
  showAccountHeader,
  hideBottomBar,
  confirmDisabled = false,
  getFeeForFeeRate,
  onFeeRateSet,
}: Props) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);

  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });
  const { selectedAccount } = useWalletSelector();

  const hideBackButton = !onBackClick;

  const onConfirmPress = async () => {
    if (!isLedgerAccount(selectedAccount)) {
      return onConfirm();
    }

    // show ledger connection screens
    setIsModalVisible(true);
  };

  const handleConnectAndConfirm = async () => {
    if (!selectedAccount) {
      console.error('No account selected');
      return;
    }
    setIsButtonDisabled(true);

    const transport = await TransportFactory.create();

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
      onConfirm(transport);
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
    }
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  // TODO: this is a bit naive, but should be correct. We may want to look at the sig hash types of the inputs instead
  const isPartialTransaction = !feeOutput;

  return isLoading ? (
    <LoaderContainer>
      <MoonLoader color="white" size={50} />
    </LoaderContainer>
  ) : (
    <>
      <SendLayout
        selectedBottomTab="dashboard"
        onClickBack={onBackClick}
        hideBackButton={hideBackButton}
        showAccountHeader={showAccountHeader}
        hideBottomBar={hideBottomBar}
      >
        <ReviewTransactionText typography="headline_s">
          {t('REVIEW_TRANSACTION')}
        </ReviewTransactionText>
        {!isBroadcast && <BroadcastCallout bodyText={t('PSBT_NO_BROADCAST_DISCLAIMER')} />}
        <TransactionSummary
          inputs={inputs}
          outputs={outputs}
          feeOutput={feeOutput}
          isPartialTransaction={isPartialTransaction}
          getFeeForFeeRate={getFeeForFeeRate}
          onFeeRateSet={onFeeRateSet}
          isSubmitting={isSubmitting}
        />
        {!isLoading && (
          <StickyHorizontalSplitButtonContainer>
            <ActionButton onPress={onCancel} text={cancelText} transparent />
            <ActionButton
              onPress={onConfirmPress}
              disabled={confirmDisabled}
              processing={isSubmitting}
              text={confirmText}
              warning={isError}
            />
          </StickyHorizontalSplitButtonContainer>
        )}
      </SendLayout>
      <BottomModal header="" visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        {currentStepIndex === 0 && (
          <LedgerConnectionView
            title={signatureRequestTranslate('LEDGER.CONNECT.TITLE')}
            text={signatureRequestTranslate('LEDGER.CONNECT.SUBTITLE', { name: 'Bitcoin' })}
            titleFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE')}
            textFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_SUBTITLE')}
            imageDefault={ledgerConnectBtcIcon}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
          />
        )}
        {currentStepIndex === 1 && (
          <LedgerConnectionView
            title={signatureRequestTranslate('LEDGER.CONFIRM.TITLE')}
            text={signatureRequestTranslate('LEDGER.CONFIRM.SUBTITLE')}
            titleFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_TITLE')}
            textFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_SUBTITLE')}
            imageDefault={ledgerConnectDefaultIcon}
            isConnectSuccess={false}
            isConnectFailed={isTxRejected}
          />
        )}
        <SuccessActionsContainer>
          <ActionButton
            onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
            text={signatureRequestTranslate(
              isTxRejected || isConnectFailed ? 'LEDGER.RETRY_BUTTON' : 'LEDGER.CONNECT_BUTTON',
            )}
            disabled={isButtonDisabled}
            processing={isButtonDisabled}
          />
          <ActionButton
            onPress={onCancel}
            text={signatureRequestTranslate('LEDGER.CANCEL_BUTTON')}
            transparent
          />
        </SuccessActionsContainer>
      </BottomModal>
    </>
  );
}

export default ConfirmBtcTransaction;
