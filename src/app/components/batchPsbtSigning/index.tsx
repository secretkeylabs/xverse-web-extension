import AccountHeaderComponent from '@components/accountHeader';
import { TxSummaryContext } from '@components/confirmBtcTransaction/hooks/useTxSummaryContext';
import ConfirmBatchBtcTransactions from '@components/confirmBtcTransaction/indexBatch';
import TransactionSummary from '@components/confirmBtcTransaction/transactionSummary';
import LedgerSteps from '@components/ledgerSteps';
import LoadingTransactionStatus from '@components/loadingTransactionStatus';
import type { ConfirmationStatus } from '@components/loadingTransactionStatus/circularSvgAnimation';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import type { SignMultiplePsbtPayload } from '@sats-connect/core';
import {
  AnalyticsEvents,
  btcTransaction,
  extractViewSummary,
  type AggregatedSummary,
  type Transport,
  type UserTransactionSummary,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Sheet from '@ui-library/sheet';
import Spinner from '@ui-library/spinner';
import { isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  BundleLinkContainer,
  BundleLinkText,
  ButtonsContainer,
  Container,
  HeaderContainer,
  InlineButtonsContainer,
  LoaderContainer,
  ModalContainer,
  OuterContainer,
  ReviewTransactionText,
  SmallButton,
  StyledSheet,
} from './index.styled';

type ParsedPsbt = {
  extractedSummary: UserTransactionSummary | AggregatedSummary;
  summary: btcTransaction.PsbtSummary;
};

interface BatchPsbtSigningProps {
  psbts: SignMultiplePsbtPayload[];
  onSigned: (signedPsbts: string[]) => void | Promise<void>;
  onCancel: () => void;
  onPostSignDone: () => void;
}

function BatchPsbtSigning({ onSigned, psbts, onCancel, onPostSignDone }: BatchPsbtSigningProps) {
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const txnContext = useTransactionContext();
  useTrackMixPanelPageViewed();

  const [isSigning, setIsSigning] = useState(false);
  const [isSigningComplete, setIsSigningComplete] = useState(false);
  const [signingPsbtIndex, setSigningPsbtIndex] = useState(1);
  const [currentPsbtIndex, setCurrentPsbtIndex] = useState(0);
  const singlePsbt = psbts.length === 1;
  const [reviewTransaction, setReviewTransaction] = useState(singlePsbt);
  const [isLoading, setIsLoading] = useState(true);
  const [parsedPsbts, setParsedPsbts] = useState<ParsedPsbt[]>([]);
  const [isLedgerModalVisible, setIsLedgerModalVisible] = useState(false);

  const individualTxSummaryContext = useMemo(
    () => ({
      extractedTxSummary: parsedPsbts[currentPsbtIndex]?.extractedSummary,
    }),
    [parsedPsbts, currentPsbtIndex],
  );

  useEffect(() => {
    const handlePsbtParsing = async (psbt: SignMultiplePsbtPayload): Promise<ParsedPsbt> => {
      try {
        const parsedPsbt = new btcTransaction.EnhancedPsbt(txnContext, psbt.psbtBase64);
        const summary = await parsedPsbt.getSummary();
        const extractedSummary = await extractViewSummary(txnContext, summary, network.type);
        return { extractedSummary, summary };
      } catch (err) {
        throw new Error('PSBT parsing failed');
      }
    };

    (async () => {
      const parsedPsbtsRes = await Promise.allSettled(psbts.map(handlePsbtParsing));
      setIsLoading(false);

      const index = parsedPsbtsRes.findIndex((item) => item.status === 'rejected');
      if (index !== -1) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle: t('PSBT_CANT_PARSE_ERROR_TITLE'),
            error: t('PSBT_INDEX_CANT_PARSE_ERROR_DESCRIPTION', { index }),
            browserTx: true,
          },
        });
        return;
      }

      const validParsedPsbts = parsedPsbtsRes.map(
        (item) => (item.status === 'fulfilled' && item.value) as ParsedPsbt,
      );
      setParsedPsbts(validParsedPsbts);
    })();
  }, [psbts, txnContext, network, navigate, t]);

  const onSignPsbtConfirmed = async (transport?: Transport) => {
    try {
      if (isLedgerAccount(selectedAccount) && !transport) {
        setIsLedgerModalVisible(true);
        return;
      }

      setIsSigning(true);

      const signedPsbts: string[] = [];

      for (let i = 0; i < psbts.length; i++) {
        const psbt = psbts[i];
        const enhancedPsbt = new btcTransaction.EnhancedPsbt(
          txnContext,
          psbt.psbtBase64,
          psbt.inputsToSign,
        );

        const psbtBase64 = await enhancedPsbt.getSignedPsbtBase64({
          finalize: false,
          ledgerTransport: transport,
        });
        signedPsbts.push(psbtBase64);

        if (i !== psbts.length - 1) {
          setSigningPsbtIndex((prevIndex) => prevIndex + 1);
        }
      }

      trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
        protocol: 'bitcoin',
        action: 'sign-psbt',
        wallet_type: selectedAccount.accountType || 'software',
        batch: psbts.length,
      });
      setIsSigningComplete(true);
      setIsSigning(false);

      onSigned(signedPsbts);
      setIsLedgerModalVisible(false);
    } catch (err) {
      setIsSigning(false);
      setIsSigningComplete(false);

      if (err instanceof Error) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle: t('PSBT_CANT_SIGN_ERROR_TITLE'),
            error: err.message,
            browserTx: true,
          },
        });
      }
    }
  };

  const renderSign = isSigning || isSigningComplete;

  const renderPreSign = () => {
    if (renderSign) return null;

    const visitedInputs = new Set<string>();
    const hasDuplicateInputs = parsedPsbts.some((parsedPsbt) => {
      const inputLocations = parsedPsbt.summary.inputs.map(
        (input) => input.extendedUtxo.utxo.txid + input.extendedUtxo.utxo.vout,
      );
      const hasDuplicate = inputLocations.some((input) => {
        if (visitedInputs.has(input)) {
          return true;
        }
        visitedInputs.add(input);
        return false;
      });
      return hasDuplicate;
    });

    const renderBody = () => {
      if (hasDuplicateInputs) {
        // if there are duplicate inputs on the individual transactions, we won't show a summary
        // and will have to ask the user to review each txn individually
        return null;
      }

      if (isLoading) {
        return (
          <LoaderContainer>
            <Spinner color="white" size={50} />
          </LoaderContainer>
        );
      }

      return (
        <>
          <OuterContainer>
            <Container>
              <ReviewTransactionText>
                {t('SIGN_TRANSACTIONS', { count: parsedPsbts.length })}
              </ReviewTransactionText>
              <BundleLinkContainer onClick={() => setReviewTransaction(true)}>
                <BundleLinkText>{t('REVIEW_ALL')}</BundleLinkText>
                <ArrowRight size={12} weight="bold" />
              </BundleLinkContainer>
              <ConfirmBatchBtcTransactions summaries={parsedPsbts} />
            </Container>
          </OuterContainer>
          <ButtonsContainer>
            <Button title={t('CANCEL')} variant="secondary" onClick={onCancel} />
            <Button
              title={t('CONFIRM_ALL')}
              onClick={() => onSignPsbtConfirmed()}
              loading={isSigning}
            />
          </ButtonsContainer>
        </>
      );
    };

    const onReviewDone = () => {
      setReviewTransaction(false);
      setCurrentPsbtIndex(0);
    };

    return (
      <>
        <AccountHeaderComponent disableMenuOption disableAccountSwitch />
        {renderBody()}
        <StyledSheet
          header=""
          visible={reviewTransaction || hasDuplicateInputs}
          onClose={hasDuplicateInputs ? undefined : onReviewDone}
        >
          <OuterContainer>
            <ModalContainer>
              <HeaderContainer>
                <ReviewTransactionText>
                  {t('TRANSACTION')} {currentPsbtIndex + 1}/{parsedPsbts.length}
                </ReviewTransactionText>
                {hasDuplicateInputs && (
                  <InlineButtonsContainer>
                    <SmallButton
                      title=""
                      variant="secondary"
                      onClick={() => {
                        setCurrentPsbtIndex((prevIndex) => prevIndex - 1);
                      }}
                      icon={<ArrowLeft size={16} weight="bold" />}
                      disabled={currentPsbtIndex === 0}
                    />
                    <SmallButton
                      title=""
                      variant="secondary"
                      onClick={() => {
                        setCurrentPsbtIndex((prevIndex) => prevIndex + 1);
                      }}
                      icon={<ArrowRight size={16} weight="bold" />}
                      iconPosition="right"
                      disabled={currentPsbtIndex === parsedPsbts.length - 1}
                    />
                  </InlineButtonsContainer>
                )}
              </HeaderContainer>
              {!!parsedPsbts[currentPsbtIndex] && (
                <TxSummaryContext.Provider value={individualTxSummaryContext}>
                  <TransactionSummary />
                </TxSummaryContext.Provider>
              )}
            </ModalContainer>
          </OuterContainer>
          <ButtonsContainer>
            {hasDuplicateInputs && (
              <>
                <Button title={t('CANCEL')} variant="secondary" onClick={onCancel} />
                <Button
                  title={t('CONFIRM_ALL')}
                  onClick={() => onSignPsbtConfirmed()}
                  loading={isSigning}
                />
              </>
            )}
            {!hasDuplicateInputs && (
              <>
                <Button
                  title={t('PREVIOUS')}
                  variant="secondary"
                  onClick={() => {
                    setCurrentPsbtIndex((prevIndex) => prevIndex - 1);
                  }}
                  icon={<ArrowLeft size={16} weight="bold" />}
                  disabled={currentPsbtIndex === 0}
                />
                <Button
                  title={t('NEXT')}
                  variant="secondary"
                  onClick={() => {
                    setCurrentPsbtIndex((prevIndex) => prevIndex + 1);
                  }}
                  icon={<ArrowRight size={16} weight="bold" />}
                  iconPosition="right"
                  disabled={currentPsbtIndex === parsedPsbts.length - 1}
                />
              </>
            )}
          </ButtonsContainer>
        </StyledSheet>
      </>
    );
  };

  const renderSigning = () => {
    if (!renderSign || (!isSigningComplete && isLedgerModalVisible)) return null;

    const signingStatus: ConfirmationStatus = isSigningComplete ? 'SUCCESS' : 'LOADING';
    return (
      <LoadingTransactionStatus
        status={signingStatus}
        resultTexts={{
          title: t('TRANSACTIONS_SIGNED'),
          description: '',
        }}
        loadingTexts={{
          title: `${t('SIGNING_TRANSACTIONS')} ${signingPsbtIndex}/${psbts.length}...`,
          description: t('THIS_MAY_TAKE_A_FEW_MINUTES'),
        }}
        loadingPercentage={isSigningComplete ? 1 : signingPsbtIndex / psbts.length}
        primaryAction={{ onPress: onPostSignDone, text: t('CLOSE') }}
        withLoadingBgCircle
      />
    );
  };

  const onLedgerCancel = () => {
    if (isSigning) {
      onCancel();
      return;
    }

    setIsLedgerModalVisible(false);
  };

  return (
    <>
      {renderPreSign()}
      {renderSigning()}
      <Sheet visible={isLedgerModalVisible} onClose={() => setIsLedgerModalVisible(false)}>
        {isLedgerModalVisible && (
          <LedgerSteps
            onConfirm={onSignPsbtConfirmed}
            onCancel={onLedgerCancel}
            txnToSignCount={psbts.length}
            txnSignIndex={signingPsbtIndex}
          />
        )}
      </Sheet>
    </>
  );
}

export default BatchPsbtSigning;
