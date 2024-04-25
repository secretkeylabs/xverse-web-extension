import { delay } from '@common/utils/ledger';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import { Tab } from '@components/tabBar';
import useWalletSelector from '@hooks/useWalletSelector';
import TransportFactory from '@ledgerhq/hw-transport-webusb';
import { RuneSummary, Transport, btcTransaction } from '@secretkeylabs/xverse-core';
import Callout from '@ui-library/callout';
import { StickyHorizontalSplitButtonContainer, StyledP } from '@ui-library/common.styled';
import Spinner from '@ui-library/spinner';
import { isLedgerAccount } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import SendLayout from '../../layouts/sendLayout';
import LedgerStepView, { Steps } from './ledgerStepView';
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

const SpacedCallout = styled(Callout)`
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
  runeSummary?: RuneSummary;
  showCenotaphCallout: boolean;
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
  getFeeForFeeRate?: (
    feeRate: number,
    useEffectiveFeeRate?: boolean,
  ) => Promise<number | undefined>;
  onFeeRateSet?: (feeRate: number) => void;
  feeRate?: number;
  hasSigHashNone?: boolean;
  title?: string;
  selectedBottomTab?: Tab;
};

function ConfirmBtcTransaction({
  inputs,
  outputs,
  feeOutput,
  runeSummary,
  showCenotaphCallout,
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
  feeRate,
  hasSigHashNone = false,
  title,
  selectedBottomTab,
}: Props) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(Steps.ConnectLedger);
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
  const hasInsufficientRunes =
    runeSummary?.transfers?.some((transfer) => !transfer.hasSufficientBalance) ?? false;
  const validMintingRune =
    !runeSummary?.mint ||
    (runeSummary?.mint && runeSummary.mint.runeIsOpen && runeSummary.mint.runeIsMintable);

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

    if (currentStep !== Steps.ExternalInputs && currentStep !== Steps.ConfirmTransaction) {
      setCurrentStep(Steps.ExternalInputs);
      return;
    }

    if (currentStep !== Steps.ConfirmTransaction) {
      setCurrentStep(Steps.ConfirmTransaction);
    }

    try {
      onConfirm(transport);
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

  // TODO: this is a bit naive, but should be correct. We may want to look at the sig hash types of the inputs instead
  const isPartialTransaction = !feeOutput;

  return isLoading ? (
    <LoaderContainer>
      <Spinner size={50} />
    </LoaderContainer>
  ) : (
    <>
      <SendLayout
        selectedBottomTab={selectedBottomTab ?? 'dashboard'}
        onClickBack={onBackClick}
        hideBackButton={hideBackButton}
        showAccountHeader={showAccountHeader}
        hideBottomBar={hideBottomBar}
      >
        <ReviewTransactionText typography="headline_s">
          {title || t('REVIEW_TRANSACTION')}
        </ReviewTransactionText>
        {hasSigHashNone && (
          <SpacedCallout
            variant="danger"
            titleText={t('PSBT_SIG_HASH_NONE_DISCLAIMER_TITLE')}
            bodyText={t('PSBT_SIG_HASH_NONE_DISCLAIMER')}
          />
        )}
        {!isBroadcast && <SpacedCallout bodyText={t('PSBT_NO_BROADCAST_DISCLAIMER')} />}
        <TransactionSummary
          runeSummary={runeSummary}
          inputs={inputs}
          outputs={outputs}
          feeOutput={feeOutput}
          isPartialTransaction={isPartialTransaction}
          showCenotaphCallout={showCenotaphCallout}
          getFeeForFeeRate={getFeeForFeeRate}
          onFeeRateSet={onFeeRateSet}
          feeRate={feeRate}
          isSubmitting={isSubmitting}
        />
        {!isLoading && (
          <StickyHorizontalSplitButtonContainer>
            <ActionButton onPress={onCancel} text={cancelText} transparent />
            <ActionButton
              onPress={onConfirmPress}
              disabled={confirmDisabled || hasInsufficientRunes || !validMintingRune}
              processing={isSubmitting}
              text={hasInsufficientRunes ? t('INSUFFICIENT_BALANCE') : confirmText}
              warning={isError || hasInsufficientRunes}
            />
          </StickyHorizontalSplitButtonContainer>
        )}
      </SendLayout>
      <BottomModal header="" visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <LedgerStepView
          currentStep={currentStep}
          isConnectSuccess={isConnectSuccess}
          isConnectFailed={isConnectFailed}
          isTxRejected={isTxRejected}
          t={t}
          signatureRequestTranslate={signatureRequestTranslate}
        />
        <SuccessActionsContainer>
          {currentStep === Steps.ExternalInputs && !isTxRejected && !isConnectFailed ? (
            <ActionButton onPress={goToConfirmationStep} text={t('LEDGER.CONTINUE_BUTTON')} />
          ) : (
            <>
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
            </>
          )}
        </SuccessActionsContainer>
      </BottomModal>
    </>
  );
}

export default ConfirmBtcTransaction;
