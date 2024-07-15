import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { delay } from '@common/utils/ledger';
import AccountHeaderComponent from '@components/accountHeader';
import AssetModal from '@components/assetModal';
import BurnSection from '@components/confirmBtcTransaction/burnSection';
import DelegateSection from '@components/confirmBtcTransaction/delegateSection';
import MintSection from '@components/confirmBtcTransaction/mintSection';
import ReceiveSection from '@components/confirmBtcTransaction/receiveSection';
import TransactionSummary from '@components/confirmBtcTransaction/transactionSummary';
import TransferSection from '@components/confirmBtcTransaction/transferSection';
import { getNetAmount, isScriptOutput } from '@components/confirmBtcTransaction/utils';
import InfoContainer from '@components/infoContainer';
import LoadingTransactionStatus from '@components/loadingTransactionStatus';
import { ConfirmationStatus } from '@components/loadingTransactionStatus/circularSvgAnimation';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useHasFeature from '@hooks/useHasFeature';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useSignBatchPsbtTx from '@hooks/useSignBatchPsbtTx';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { SignMultiplePsbtPayload } from '@sats-connect/core';
import {
  AnalyticsEvents,
  FeatureId,
  RuneSummary,
  btcTransaction,
  parseSummaryForRunes,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import Spinner from '@ui-library/spinner';
import { isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BundleLinkContainer,
  BundleLinkText,
  ButtonsContainer,
  Container,
  LoaderContainer,
  OuterContainer,
  ReviewTransactionText,
  StyledSheet,
  TransparentButtonContainer,
  TxReviewModalControls,
} from './index.styled';

interface TxResponse {
  txId: string;
  psbtBase64: string;
}

// TODO: export this from core
type PsbtSummary = Awaited<ReturnType<btcTransaction.EnhancedPsbt['getSummary']>>;

function SignBatchPsbtRequest() {
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { payload, confirmSignPsbt, cancelSignPsbt, requestToken } = useSignBatchPsbtTx();
  const [isSigning, setIsSigning] = useState(false);
  const [isSigningComplete, setIsSigningComplete] = useState(false);
  const [signingPsbtIndex, setSigningPsbtIndex] = useState(1);
  const [currentPsbtIndex, setCurrentPsbtIndex] = useState(0);
  const [reviewTransaction, setReviewTransaction] = useState(false);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tabId = params.get('tabId') ?? '0';
  const [isLoading, setIsLoading] = useState(true);
  const txnContext = useTransactionContext();
  const [inscriptionToShow, setInscriptionToShow] = useState<
    btcTransaction.IOInscription | undefined
  >(undefined);
  const hasRunesSupport = useHasFeature(FeatureId.RUNES_SUPPORT);
  useTrackMixPanelPageViewed();

  const [parsedPsbts, setParsedPsbts] = useState<
    { summary: PsbtSummary; runeSummary: RuneSummary | undefined }[]
  >([]);

  const handlePsbtParsing = useCallback(
    async (psbt: SignMultiplePsbtPayload, index: number) => {
      try {
        const parsedPsbt = new btcTransaction.EnhancedPsbt(txnContext, psbt.psbtBase64);
        const summary = await parsedPsbt.getSummary();
        const runeSummary = hasRunesSupport
          ? await parseSummaryForRunes(txnContext, summary, network.type)
          : undefined;
        return { summary, runeSummary };
      } catch (err) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle: t('PSBT_CANT_PARSE_ERROR_TITLE'),
            error: t('PSBT_INDEX_CANT_PARSE_ERROR_DESCRIPTION', { index }),
            browserTx: true,
          },
        });
        return undefined;
      }
    },
    [txnContext],
  );

  useEffect(() => {
    (async () => {
      const parsedPsbtsResult = await Promise.all(payload.psbts.map(handlePsbtParsing));
      if (parsedPsbtsResult.some((item) => item === undefined)) {
        return setIsLoading(false);
      }
      setParsedPsbts(
        parsedPsbtsResult as { summary: PsbtSummary; runeSummary: RuneSummary | undefined }[],
      );
      setIsLoading(false);
    })();
  }, [payload.psbts.length, handlePsbtParsing]);

  const checkAddressMismatch = (input) => {
    if (
      input.address !== selectedAccount.btcAddress &&
      input.address !== selectedAccount.ordinalsAddress
    ) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: t('ADDRESS_MISMATCH'),
          browserTx: true,
        },
      });
    }
  };

  const checkIfMismatch = () => {
    if (payload.network.type !== network.type) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: t('NETWORK_MISMATCH'),
          browserTx: true,
        },
      });
    }

    payload.psbts.forEach((psbt) => psbt.inputsToSign.forEach(checkAddressMismatch));
  };

  useEffect(() => {
    checkIfMismatch();
  }, []);

  const onSignPsbtConfirmed = async () => {
    try {
      if (isLedgerAccount(selectedAccount)) {
        // setIsModalVisible(true);
        return;
      }
      setIsSigning(true);

      const signedPsbts: TxResponse[] = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const psbt of payload.psbts) {
        // eslint-disable-next-line no-await-in-loop
        await delay(100);

        // eslint-disable-next-line no-await-in-loop
        const signedPsbt = await confirmSignPsbt(psbt);
        signedPsbts.push({
          txId: signedPsbt.txId,
          psbtBase64: signedPsbt.signingResponse,
        });

        if (payload.psbts.findIndex((item) => item === psbt) !== payload.psbts.length - 1) {
          setSigningPsbtIndex((prevIndex) => prevIndex + 1);
        }
      }

      trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
        protocol: 'bitcoin',
        action: 'sign-psbt',
        wallet_type: selectedAccount.accountType || 'software',
        batch: payload.psbts.length,
      });

      setIsSigningComplete(true);
      setIsSigning(false);

      const signingMessage = {
        source: MESSAGE_SOURCE,
        method: SatsConnectMethods.signBatchPsbtResponse,
        payload: {
          signBatchPsbtRequest: requestToken,
          signBatchPsbtResponse: signedPsbts,
        },
      };

      chrome.tabs.sendMessage(+tabId, signingMessage);
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

  const onCancelClick = async () => {
    cancelSignPsbt();
    window.close();
  };

  const closeCallback = () => {
    window.close();
  };

  const totalNetAmount = parsedPsbts.reduce(
    (sum, psbt) =>
      psbt && psbt.summary
        ? sum.plus(
            new BigNumber(
              getNetAmount({
                inputs: psbt.summary.inputs,
                outputs: psbt.summary.outputs,
                btcAddress: selectedAccount.btcAddress,
                ordinalsAddress: selectedAccount.ordinalsAddress,
              }),
            ),
          )
        : sum,
    new BigNumber(0),
  );
  const totalFeeAmount = parsedPsbts.reduce((sum, psbt) => {
    const feeAmount = psbt.summary.feeOutput?.amount ?? 0;
    return sum.plus(new BigNumber(feeAmount));
  }, new BigNumber(0));

  const hasOutputScript = useMemo(
    () => parsedPsbts.some((psbt) => psbt.summary.outputs.some((output) => isScriptOutput(output))),
    [parsedPsbts.length],
  );

  const signingStatus: ConfirmationStatus = isSigningComplete ? 'SUCCESS' : 'LOADING';

  if (isSigning || isSigningComplete) {
    return (
      <LoadingTransactionStatus
        status={signingStatus}
        resultTexts={{
          title: t('TRANSACTIONS_SIGNED'),
          description: '',
        }}
        loadingTexts={{
          title: `${t('SIGNING_TRANSACTIONS')} ${signingPsbtIndex}/${payload.psbts.length}...`,
          description: t('THIS_MAY_TAKE_A_FEW_MINUTES'),
        }}
        loadingPercentage={isSigningComplete ? 1 : signingPsbtIndex / payload.psbts.length}
        primaryAction={{ onPress: closeCallback, text: t('CLOSE') }}
        withLoadingBgCircle
      />
    );
  }

  const transactionIsFinal = parsedPsbts.reduce((acc, psbt) => acc && psbt.summary.isFinal, true);
  const runeBurns = parsedPsbts.map((psbt) => psbt.runeSummary?.burns ?? []).flat();
  const runeDelegations = parsedPsbts
    .filter((psbt) => !psbt.summary.isFinal)
    .map((psbt) => psbt.runeSummary?.transfers ?? [])
    .flat();
  const hasSomeRuneDelegation = runeDelegations.length > 0;

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      {isLoading ? (
        <LoaderContainer>
          <Spinner color="white" size={50} />
        </LoaderContainer>
      ) : (
        <>
          <OuterContainer>
            {isLedgerAccount(selectedAccount) ? (
              <Container>
                <InfoContainer bodyText="External transaction requests are not yet supported on a Ledger account. Switch to a different account to sign transactions from the application." />
              </Container>
            ) : (
              <Container>
                <ReviewTransactionText>
                  {t('SIGN_TRANSACTIONS', { count: parsedPsbts.length })}
                </ReviewTransactionText>
                <BundleLinkContainer onClick={() => setReviewTransaction(true)}>
                  <BundleLinkText>{t('REVIEW_ALL')}</BundleLinkText>
                  <ArrowRight size={12} weight="bold" />
                </BundleLinkContainer>
                {inscriptionToShow && (
                  <AssetModal
                    onClose={() => setInscriptionToShow(undefined)}
                    inscription={{
                      content_type: inscriptionToShow.contentType,
                      id: inscriptionToShow.id,
                      inscription_number: inscriptionToShow.number,
                    }}
                  />
                )}
                {hasSomeRuneDelegation && <DelegateSection delegations={runeDelegations} />}
                <TransferSection
                  inputs={parsedPsbts.map((psbt) => psbt.summary.inputs).flat()}
                  outputs={parsedPsbts.map((psbt) => psbt.summary.outputs).flat()}
                  runeTransfers={parsedPsbts
                    .map((psbt) => psbt.runeSummary?.transfers ?? [])
                    .flat()}
                  netAmount={(totalNetAmount.toNumber() + totalFeeAmount.toNumber()) * -1}
                  transactionIsFinal={transactionIsFinal}
                  onShowInscription={setInscriptionToShow}
                />
                <ReceiveSection
                  outputs={parsedPsbts.map((psbt) => psbt.summary.outputs).flat()}
                  runeReceipts={parsedPsbts.map((psbt) => psbt.runeSummary?.receipts ?? []).flat()}
                  onShowInscription={setInscriptionToShow}
                  netAmount={totalNetAmount.toNumber()}
                  transactionIsFinal={transactionIsFinal}
                />
                {!hasSomeRuneDelegation && <BurnSection burns={runeBurns} />}
                <MintSection mints={parsedPsbts.map((psbt) => psbt.runeSummary?.mint)} />
                <TransactionDetailComponent title={t('NETWORK')} value={network.type} />
                {hasOutputScript && !parsedPsbts.some((psbt) => psbt.runeSummary !== undefined) && (
                  <Callout bodyText={t('SCRIPT_OUTPUT_TX')} />
                )}
              </Container>
            )}
          </OuterContainer>
          <ButtonsContainer>
            <TransparentButtonContainer>
              <Button title={t('CANCEL')} variant="secondary" onClick={onCancelClick} />
            </TransparentButtonContainer>
            <Button
              title={t('CONFIRM_ALL')}
              onClick={onSignPsbtConfirmed}
              loading={isSigning}
              disabled={isLedgerAccount(selectedAccount)}
            />
          </ButtonsContainer>
        </>
      )}
      <StyledSheet
        title=""
        visible={reviewTransaction}
        onClose={() => {
          setReviewTransaction(false);
          setCurrentPsbtIndex(0);
        }}
      >
        <ReviewTransactionText>
          {t('TRANSACTION')} {currentPsbtIndex + 1}/{parsedPsbts.length}
        </ReviewTransactionText>
        {!!parsedPsbts[currentPsbtIndex] && (
          <TransactionSummary
            inputs={parsedPsbts[currentPsbtIndex].summary.inputs}
            outputs={parsedPsbts[currentPsbtIndex].summary.outputs}
            feeOutput={parsedPsbts[currentPsbtIndex].summary.feeOutput}
            runeSummary={parsedPsbts[currentPsbtIndex].runeSummary}
            transactionIsFinal={parsedPsbts[currentPsbtIndex].summary.isFinal}
            showCenotaphCallout={!!parsedPsbts[currentPsbtIndex].summary.runeOp?.Cenotaph?.flaws}
          />
        )}
        <TxReviewModalControls>
          {currentPsbtIndex > 0 && (
            <Button
              title={t('PREVIOUS')}
              variant="secondary"
              onClick={() => {
                setCurrentPsbtIndex((prevIndex) => prevIndex - 1);
              }}
              icon={<ArrowLeft color="white" size={16} weight="bold" />}
            />
          )}
          {currentPsbtIndex < parsedPsbts.length - 1 && (
            <Button
              title={t('NEXT')}
              variant="secondary"
              onClick={() => {
                setCurrentPsbtIndex((prevIndex) => prevIndex + 1);
              }}
              icon={<ArrowRight color="white" size={16} weight="bold" />}
              iconPosition="right"
            />
          )}
          {currentPsbtIndex === parsedPsbts.length - 1 && (
            <Button
              title={t('DONE')}
              onClick={() => {
                setReviewTransaction(false);
                setCurrentPsbtIndex(0);
              }}
            />
          )}
        </TxReviewModalControls>
      </StyledSheet>
    </>
  );
}

export default SignBatchPsbtRequest;
