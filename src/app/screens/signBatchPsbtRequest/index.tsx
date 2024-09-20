import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { delay } from '@common/utils/ledger';
import AccountHeaderComponent from '@components/accountHeader';

import { TxSummaryContext } from '@components/confirmBtcTransaction/hooks/useTxSummaryContext';
import ConfirmBatchBtcTransactions from '@components/confirmBtcTransaction/indexBatch';
import TransactionSummary from '@components/confirmBtcTransaction/transactionSummary';
import InfoContainer from '@components/infoContainer';
import LoadingTransactionStatus from '@components/loadingTransactionStatus';
import type { ConfirmationStatus } from '@components/loadingTransactionStatus/circularSvgAnimation';
import useXverseApi from '@hooks/apiClients/useXverseApi';
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
  btcTransaction,
  extractViewSummary,
  type AggregatedSummary,
  type UserTransactionSummary,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Spinner from '@ui-library/spinner';
import { isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import type { RuneItem } from '@utils/runes';
import { useEffect, useMemo, useState } from 'react';
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

type ParsedPsbt = {
  extractedSummary: UserTransactionSummary | AggregatedSummary;
  summary: btcTransaction.PsbtSummary;
};

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
    locationState,
  } = useSignBatchPsbtTx();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tabId = params.get('tabId') ?? '0';
  const txnContext = useTransactionContext();
  useTrackMixPanelPageViewed();
  const xverseApi = useXverseApi();

  const [isSigning, setIsSigning] = useState(false);
  const [isSigningComplete, setIsSigningComplete] = useState(false);
  const [signingPsbtIndex, setSigningPsbtIndex] = useState(1);
  const [currentPsbtIndex, setCurrentPsbtIndex] = useState(0);
  const [reviewTransaction, setReviewTransaction] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [parsedPsbts, setParsedPsbts] = useState<ParsedPsbt[]>([]);

  const individualTxSummaryContext = useMemo(
    () => ({
      extractedTxSummary: parsedPsbts[currentPsbtIndex]?.extractedSummary,
    }),
    [parsedPsbts, currentPsbtIndex],
  );

  useEffect(() => {
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

    payload.psbts?.forEach((psbt) => psbt.inputsToSign?.forEach(checkAddressMismatch));
  }, []);

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
      const parsedPsbtsRes = await Promise.allSettled(payload.psbts.map(handlePsbtParsing));
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
  }, [payload.psbts, txnContext, network, navigate, t]);

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
        trackMixPanel(AnalyticsEvents.ListRuneSigned, {
          from: locationState.selectedRune.name,
          to: 'BTC',
          priceInSatsPerRune: locationState.minPriceSats,
          marketplaces: locationState.payload.psbts.map((p) => p.marketplaceName),
          runeTotalAmount: Object.values(locationState.utxos as Record<string, RuneItem>)
            .map((i) => i.amount)
            .reduce((a, b) => a + b, 0),
        });

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

  const renderBody = () => {
    if (isLoading) {
      return (
        <LoaderContainer>
          <Spinner color="white" size={50} />
        </LoaderContainer>
      );
    }

    const isLedger = isLedgerAccount(selectedAccount);

    return (
      <>
        <OuterContainer>
          <Container>
            {isLedger ? (
              <InfoContainer bodyText="External transaction requests are not yet supported on a Ledger account. Switch to a different account to sign transactions from the application." />
            ) : (
              <>
                <ReviewTransactionText>
                  {t('SIGN_TRANSACTIONS', { count: parsedPsbts.length })}
                </ReviewTransactionText>
                <BundleLinkContainer onClick={() => setReviewTransaction(true)}>
                  <BundleLinkText>{t('REVIEW_ALL')}</BundleLinkText>
                  <ArrowRight size={12} weight="bold" />
                </BundleLinkContainer>
                <ConfirmBatchBtcTransactions summaries={parsedPsbts} isDuplicateTxs={inApp} />
              </>
            )}
          </Container>
        </OuterContainer>
        <ButtonsContainer>
          <TransparentButtonContainer>
            <Button title={t('CANCEL')} variant="secondary" onClick={onCancelClick} />
          </TransparentButtonContainer>
          <Button
            title={t('CONFIRM_ALL')}
            onClick={onSignPsbtConfirmed}
            loading={isSigning}
            disabled={isLedger}
          />
        </ButtonsContainer>
      </>
    );
  };

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      {renderBody()}
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
              <TxSummaryContext.Provider value={individualTxSummaryContext}>
                <TransactionSummary />
              </TxSummaryContext.Provider>
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
