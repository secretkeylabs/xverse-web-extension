import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { delay } from '@common/utils/ledger';
import AccountHeaderComponent from '@components/accountHeader';
import AssetModal from '@components/assetModal';
import BurnSection from '@components/confirmBtcTransaction/burnSection';
import DelegateSection from '@components/confirmBtcTransaction/delegateSection';
import {
  ParsedTxSummaryContext,
  type ParsedTxSummaryContextProps,
} from '@components/confirmBtcTransaction/hooks/useParsedTxSummaryContext';
import MintSection from '@components/confirmBtcTransaction/mintSection';
import ReceiveSection from '@components/confirmBtcTransaction/receiveSection';
import TransactionSummary from '@components/confirmBtcTransaction/transactionSummary';
import TransferSection from '@components/confirmBtcTransaction/transferSection';
import { isScriptOutput } from '@components/confirmBtcTransaction/utils';
import InfoContainer from '@components/infoContainer';
import LoadingTransactionStatus from '@components/loadingTransactionStatus';
import type { ConfirmationStatus } from '@components/loadingTransactionStatus/circularSvgAnimation';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useXverseApi from '@hooks/apiClients/useXverseApi';
import useHasFeature from '@hooks/useHasFeature';
import useSearchParamsState from '@hooks/useSearchParamsState';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useSignBatchPsbtTx from '@hooks/useSignBatchPsbtTx';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import type { SignMultiplePsbtPayload } from '@sats-connect/core';
import { SigHash } from '@scure/btc-signer';
import {
  AnalyticsEvents,
  FeatureId,
  btcTransaction,
  parseSummaryForRunes,
  type RuneSummary,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import Spinner from '@ui-library/spinner';
import { isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import objecthash from 'object-hash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BundleLinkContainer,
  BundleLinkText,
  ButtonsContainer,
  Container,
  LoaderContainer,
  ModalContainer,
  OuterContainer,
  ReviewTransactionText,
  StyledSheet,
  TransparentButtonContainer,
  TxReviewModalControls,
} from './index.styled';

interface TxResponse {
  txId: string;
  psbtBase64: string;
  marketplaceName?: string;
  batchAuctionId?: string;
}

type PsbtSummary = btcTransaction.PsbtSummary;
type ParsedPsbt = { summary: PsbtSummary; runeSummary: RuneSummary | undefined };
function SignBatchPsbtRequest() {
  const [inApp] = useSearchParamsState('signBatchPsbtsInApp', false);
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const {
    payload,
    utxos,
    confirmSignPsbt,
    cancelSignPsbt,
    requestToken,
    selectedRune,
    minPriceSats,
  } = useSignBatchPsbtTx();
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
  const [parsedPsbts, setParsedPsbts] = useState<ParsedPsbt[]>([]);
  const xverseApi = useXverseApi();

  const individualParsedTxSummaryContext = useMemo(
    () => ({
      summary: parsedPsbts[currentPsbtIndex]?.summary,
      runeSummary: parsedPsbts[currentPsbtIndex]?.runeSummary,
    }),
    [parsedPsbts, currentPsbtIndex],
  );

  const aggregatedParsedTxSummaryContext: ParsedTxSummaryContextProps = useMemo(
    () => ({
      summary: {
        inputs: parsedPsbts.map((psbt) => psbt.summary.inputs).flat(),
        outputs: parsedPsbts.map((psbt) => psbt.summary.outputs).flat(),
        feeOutput: undefined,
        isFinal: parsedPsbts.reduce((acc, psbt) => acc && psbt.summary.isFinal, true),
        hasSigHashNone: parsedPsbts.reduce(
          (acc, psbt) => acc || (psbt.summary as btcTransaction.PsbtSummary)?.hasSigHashNone,
          false,
        ),
        hasSigHashSingle: parsedPsbts.reduce(
          (acc, psbt) => acc || (psbt.summary as btcTransaction.PsbtSummary)?.hasSigHashSingle,
          false,
        ),
      } as PsbtSummary,
      runeSummary: {
        burns: parsedPsbts.map((psbt) => psbt.runeSummary?.burns ?? []).flat(),
        transfers: parsedPsbts.map((psbt) => psbt.runeSummary?.transfers ?? []).flat(),
        receipts: parsedPsbts.map((psbt) => psbt.runeSummary?.receipts ?? []).flat(),
        mint: undefined,
        inputsHadRunes: false,
      } as RuneSummary,
    }),
    [parsedPsbts],
  );

  const handlePsbtParsing = useCallback(
    async (psbt: SignMultiplePsbtPayload, index: number): Promise<ParsedPsbt | undefined> => {
      try {
        const parsedPsbt = new btcTransaction.EnhancedPsbt(txnContext, psbt.psbtBase64);
        const summary = await parsedPsbt.getSummary();
        const runeSummary = hasRunesSupport
          ? await parseSummaryForRunes(txnContext, summary, network.type, {
              separateTransfersOnNoExternalInputs: true,
            })
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
      const parsedPsbtsRes = await Promise.all(payload.psbts.map(handlePsbtParsing));
      if (parsedPsbtsRes.some((item) => item === undefined)) {
        setIsLoading(false);
        return;
      }
      const validParsedPsbts = parsedPsbtsRes.filter(
        (item): item is ParsedPsbt => item !== undefined,
      );
      setParsedPsbts(validParsedPsbts);
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

    payload.psbts?.forEach((psbt) => psbt.inputsToSign?.forEach(checkAddressMismatch));
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
        const enhancedPsbt = new btcTransaction.EnhancedPsbt(txnContext, psbt.psbtBase64);

        let txId: string;
        let psbtBase64: string;
        if (inApp) {
          txId = '';
          psbtBase64 = await enhancedPsbt.getSignedPsbtBase64({
            finalize: false,
            ledgerTransport: undefined,
            allowedSigHash:
              psbt.marketplaceName === 'Magic Eden' ? [SigHash.SINGLE_ANYONECANPAY] : undefined,
          });
        } else {
          const signedPsbt = await confirmSignPsbt(psbt);

          txId = signedPsbt.txId;
          psbtBase64 = signedPsbt.signingResponse;
        }

        signedPsbts.push({
          txId,
          psbtBase64,
          marketplaceName: psbt.marketplaceName,
          batchAuctionId: psbt.batchAuctionId,
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

      if (inApp) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 10); // 10 days from now

        await xverseApi.listings
          .submitRuneSellOrder(
            signedPsbts.map((psbt) => ({
              psbtBase64: psbt.psbtBase64,
              marketplaceName: psbt.marketplaceName as string,
              batchAuctionId: psbt.batchAuctionId,
              ordinalsPublicKey: selectedAccount.ordinalsPublicKey,
              ordinalsAddress: selectedAccount.ordinalsAddress,
              btcAddress: selectedAccount.btcAddress,
              rune: {
                name: selectedRune?.assetName ?? '',
                id: selectedRune?.principal ?? '',
              },
              expiresAt: expiresAt.toISOString(),
              utxos: Object.entries(utxos).map(([location, utxo]) => ({
                txid: location.split(':')[0],
                index: Number(location.split(':')[1]),
                priceSatsPerRune: utxo.priceSats,
                runeAmount: utxo.amount,
              })),
            })),
          )
          .then((res) => {
            if (res) {
              navigate('/tx-status', {
                state: {
                  runeListed: selectedRune,
                  orders: res,
                  minPriceSats,
                },
              });
            }
          })
          .catch((_) => {
            navigate('/tx-status', {
              state: {
                txid: '',
                error: '',
                browserTx: true,
              },
            });
          });
      }
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

  const hasOutputScript = useMemo(
    () => parsedPsbts.some((psbt) => psbt.summary.outputs.some((output) => isScriptOutput(output))),
    [parsedPsbts.length],
  );

  const signingStatus: ConfirmationStatus = isSigningComplete ? 'SUCCESS' : 'LOADING';
  const runeBurns = parsedPsbts.map((psbt) => psbt.runeSummary?.burns ?? []).flat();
  const distinctRuneDelegations = new Set();
  const runeDelegations = parsedPsbts
    .filter((psbt) => !psbt.summary.isFinal)
    .map((psbt) => psbt.runeSummary?.receipts ?? [])
    .flat()
    .filter((delegation) => {
      const key = objecthash(delegation);
      if (distinctRuneDelegations.has(key)) {
        return false;
      }

      distinctRuneDelegations.add(key);
      return true;
    });
  const hasSomeRuneDelegation = runeDelegations.length > 0;

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
                <ParsedTxSummaryContext.Provider value={aggregatedParsedTxSummaryContext}>
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
                  <TransferSection onShowInscription={setInscriptionToShow} />
                  <ReceiveSection onShowInscription={setInscriptionToShow} />
                  {!hasSomeRuneDelegation && <BurnSection burns={runeBurns} />}
                  <MintSection mints={parsedPsbts.map((psbt) => psbt.runeSummary?.mint)} />
                  <TransactionDetailComponent title={t('NETWORK')} value={network.type} />
                  {hasOutputScript &&
                    !parsedPsbts.some((psbt) => psbt.runeSummary !== undefined) && (
                      <Callout bodyText={t('SCRIPT_OUTPUT_TX')} />
                    )}
                </ParsedTxSummaryContext.Provider>
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
        header=""
        visible={reviewTransaction}
        onClose={() => {
          setReviewTransaction(false);
          setCurrentPsbtIndex(0);
        }}
      >
        <OuterContainer>
          <ModalContainer>
            <ReviewTransactionText>
              {t('TRANSACTION')} {currentPsbtIndex + 1}/{parsedPsbts.length}
            </ReviewTransactionText>
            {!!parsedPsbts[currentPsbtIndex] && (
              <ParsedTxSummaryContext.Provider value={individualParsedTxSummaryContext}>
                <TransactionSummary />
              </ParsedTxSummaryContext.Provider>
            )}
          </ModalContainer>
        </OuterContainer>
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
