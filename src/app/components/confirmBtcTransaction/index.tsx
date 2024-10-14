import { delay } from '@common/utils/ledger';
import type { Tab } from '@components/tabBar';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import TransportFactory from '@ledgerhq/hw-transport-webusb';
import {
  type Brc20Definition,
  type btcTransaction,
  type EtchActionDetails,
  type MintActionDetails,
  type Transport,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Callout, { type CalloutProps } from '@ui-library/callout';
import { StickyHorizontalSplitButtonContainer, StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import Spinner from '@ui-library/spinner';
import { isKeystoneAccount, isLedgerAccount } from '@utils/helper';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { Color } from '../../../theme';
import SendLayout from '../../layouts/sendLayout';
import useExtractTxSummary from './hooks/useExtractTxSummary';
import { TxSummaryContext } from './hooks/useTxSummaryContext';
import KeystoneStepView, { KeystoneSteps } from './keystoneStepView';
import LedgerStepView, { LedgerSteps } from './ledgerStepView';
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
  transaction?: btcTransaction.EnhancedTransaction;
  summary?: btcTransaction.TransactionSummary | btcTransaction.PsbtSummary;
  runeMintDetails?: MintActionDetails;
  runeEtchDetails?: EtchActionDetails;
  brc20Summary?: Brc20Definition & { status: string; statusColor: Color };
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
  title?: string;
  selectedBottomTab?: Tab;
  customCallout?: CalloutProps;
};

function ConfirmBtcTransaction({
  transaction,
  summary,
  runeMintDetails,
  runeEtchDetails,
  brc20Summary,
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
  title,
  selectedBottomTab,
  customCallout,
}: Props) {
  const { network } = useWalletSelector();
  const selectedAccount = useSelectedAccount();

  const { data: extractedTxSummary, isLoading: extractTxSummaryLoading } = useExtractTxSummary(
    network.type,
    summary,
  );
  const parsedTxSummaryContextValue = useMemo(
    () => ({ extractedTxSummary, runeMintDetails, runeEtchDetails, brc20Summary }),
    [extractedTxSummary, runeMintDetails, runeEtchDetails, brc20Summary],
  );

  const [isLedgerModalVisible, setIsLedgerModalVisible] = useState(false);
  const [ledgerCurrentStep, setLedgerCurrentStep] = useState(LedgerSteps.ConnectLedger);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);

  const [isKeystoneModalVisible, setIsKeystoneModalVisible] = useState(false);
  const [keystoneCurrentStep, setKeystoneCurrentStep] = useState(KeystoneSteps.ViewTxQRCode);

  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });

  const onConfirmPress = async () => {
    if (isLedgerAccount(selectedAccount)) {
      // show ledger connection screens
      setIsLedgerModalVisible(true);
    } else if (isKeystoneAccount(selectedAccount)) {
      setIsKeystoneModalVisible(true);
    } else {
      return onConfirm();
    }
  };

  const handleLedgerConnectAndConfirm = async () => {
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

    if (
      ledgerCurrentStep !== LedgerSteps.ExternalInputs &&
      ledgerCurrentStep !== LedgerSteps.ConfirmTransaction
    ) {
      setLedgerCurrentStep(LedgerSteps.ExternalInputs);
      return;
    }

    if (ledgerCurrentStep !== LedgerSteps.ConfirmTransaction) {
      setLedgerCurrentStep(LedgerSteps.ConfirmTransaction);
    }

    try {
      onConfirm(transport);
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
    }
  };

  const handleKeystoneScanCompleted = async () => {
    if (!selectedAccount) {
      console.error('No account selected');
      return;
    }
    setIsButtonDisabled(true);

    setKeystoneCurrentStep(KeystoneSteps.ScanSignature);
  };

  const goToConfirmationStep = () => {
    setLedgerCurrentStep(LedgerSteps.ConfirmTransaction);

    handleLedgerConnectAndConfirm();
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    if (isLedgerModalVisible) {
      setLedgerCurrentStep(LedgerSteps.ConnectLedger);
    } else if (isKeystoneModalVisible) {
      setKeystoneCurrentStep(KeystoneSteps.ScanSignature);
    }
  };

  if (isLoading || extractTxSummaryLoading) {
    return (
      <LoaderContainer>
        <Spinner size={50} />
      </LoaderContainer>
    );
  }

  if (extractedTxSummary) {
    const { hasSigHashNone, runes } = extractedTxSummary;
    const { hasInsufficientBalance, hasInvalidMint } = runes;
    return (
      <TxSummaryContext.Provider value={parsedTxSummaryContextValue}>
        {/* TODO start a new layout. SendLayout was not intended for the review screens */}
        <SendLayout
          selectedBottomTab={selectedBottomTab ?? 'dashboard'}
          onClickBack={onBackClick}
          hideBackButton={!onBackClick}
          showAccountHeader={showAccountHeader}
          hideBottomBar={hideBottomBar}
        >
          <ReviewTransactionText typography="headline_s">
            {title || t('REVIEW_TRANSACTION')}
          </ReviewTransactionText>
          {/* TODO: add sighash single warning */}
          {hasSigHashNone && (
            <SpacedCallout
              variant="danger"
              titleText={t('PSBT_SIG_HASH_NONE_DISCLAIMER_TITLE')}
              bodyText={t('PSBT_SIG_HASH_NONE_DISCLAIMER')}
            />
          )}
          {!isBroadcast && <SpacedCallout bodyText={t('PSBT_NO_BROADCAST_DISCLAIMER')} />}
          {customCallout && <Callout {...customCallout} />}
          <TransactionSummary
            feeRate={feeRate}
            getFeeForFeeRate={getFeeForFeeRate}
            onFeeRateSet={onFeeRateSet}
            isSubmitting={isSubmitting}
          />
          {!isLoading && (
            <StickyHorizontalSplitButtonContainer>
              <Button onClick={onCancel} title={cancelText} variant="secondary" />
              <Button
                onClick={onConfirmPress}
                disabled={confirmDisabled || hasInsufficientBalance || hasInvalidMint}
                loading={isSubmitting}
                title={hasInsufficientBalance ? t('INSUFFICIENT_BALANCE') : confirmText}
                variant={isError || hasInsufficientBalance ? 'danger' : 'primary'}
              />
            </StickyHorizontalSplitButtonContainer>
          )}
        </SendLayout>
        <Sheet
          title=""
          visible={isLedgerModalVisible}
          onClose={() => setIsLedgerModalVisible(false)}
        >
          <LedgerStepView
            currentStep={ledgerCurrentStep}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
            isTxRejected={isTxRejected}
            t={t}
            signatureRequestTranslate={signatureRequestTranslate}
          />
          <SuccessActionsContainer>
            {ledgerCurrentStep === LedgerSteps.ExternalInputs &&
            !isTxRejected &&
            !isConnectFailed ? (
              <Button onClick={goToConfirmationStep} title={t('LEDGER.CONTINUE_BUTTON')} />
            ) : (
              <>
                <Button
                  onClick={
                    isTxRejected || isConnectFailed ? handleRetry : handleLedgerConnectAndConfirm
                  }
                  title={signatureRequestTranslate(
                    isTxRejected || isConnectFailed
                      ? 'LEDGER.RETRY_BUTTON'
                      : 'LEDGER.CONNECT_BUTTON',
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
        </Sheet>
        <Sheet
          title=""
          visible={isKeystoneModalVisible}
          onClose={() => setIsKeystoneModalVisible(false)}
        >
          <KeystoneStepView
            transaction={transaction}
            currentStep={keystoneCurrentStep}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
            isTxRejected={isTxRejected}
            t={t}
            signatureRequestTranslate={signatureRequestTranslate}
          />
          <SuccessActionsContainer>
            {keystoneCurrentStep === KeystoneSteps.ScanSignature && !isTxRejected ? (
              <Button onClick={onCancel} title={t('LEDGER.CANCEL_BUTTON')} />
            ) : (
              <>
                <Button
                  onClick={
                    isTxRejected || isConnectFailed ? handleRetry : handleKeystoneScanCompleted
                  }
                  title={signatureRequestTranslate(
                    isTxRejected || isConnectFailed
                      ? 'LEDGER.RETRY_BUTTON'
                      : 'LEDGER.CONNECT_BUTTON',
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
        </Sheet>
      </TxSummaryContext.Provider>
    );
  }
}

export default ConfirmBtcTransaction;
