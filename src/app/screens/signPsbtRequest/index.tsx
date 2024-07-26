import { makeRPCError, sendRpcResponse } from '@common/utils/rpc/helpers';
import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RequestError from '@components/requests/requestError';
import useSubmitRuneSellPsbt from '@hooks/queries/runes/useSubmitRuneSellPsbt';
import useHasFeature from '@hooks/useHasFeature';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import { RpcErrorCode } from '@sats-connect/core';
import { SigHash } from '@scure/btc-signer';
import {
  AnalyticsEvents,
  FeatureId,
  btcTransaction,
  parseSummaryForRunes,
  type RuneSummary,
  type Transport,
} from '@secretkeylabs/xverse-core';
import { trackMixPanel } from '@utils/mixpanel';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import useSignPsbt from './useSignPsbt';
import useSignPsbtValidationGate from './useSignPsbtValidationGate';

type PSBTSummary = btcTransaction.PsbtSummary;

function SignPsbtRequest() {
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const txnContext = useTransactionContext();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const magicEdenPsbt = searchParams.get('magicEdenPsbt');
  const runeId = searchParams.get('runeId');
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [summary, setSummary] = useState<PSBTSummary | undefined>();
  const [runeSummary, setRuneSummary] = useState<RuneSummary | undefined>(undefined);
  const hasRunesSupport = useHasFeature(FeatureId.RUNES_SUPPORT);
  const { payload, parsedPsbt, confirmSignPsbt, cancelSignPsbt, onCloseError, requestId, tabId } =
    useSignPsbt();
  const { validationError, setValidationError } = useSignPsbtValidationGate({
    payload,
    parsedPsbt,
  });
  // extend in future if necessary
  const isInAppPsbt = magicEdenPsbt && runeId;

  useTrackMixPanelPageViewed();

  const { network } = useWalletSelector();

  const { submitRuneSellPsbt } = useSubmitRuneSellPsbt();

  useEffect(() => {
    if (!parsedPsbt) return;

    parsedPsbt
      .getSummary()
      // TODO move this block into useSignPsbt
      .then(async (txSummary) => {
        setSummary(txSummary);
        if (hasRunesSupport) {
          setRuneSummary(await parseSummaryForRunes(txnContext, txSummary, network.type));
        }
        setIsLoading(false);
      })
      .catch((err) => {
        const error = makeRPCError(requestId, {
          code: RpcErrorCode.INTERNAL_ERROR,
          message: err,
        });
        sendRpcResponse(+tabId, error);
        setValidationError({
          error: JSON.stringify(err),
          errorTitle: t('PSBT_CANT_PARSE_ERROR_TITLE'),
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedPsbt]);

  const onConfirm = async (ledgerTransport?: Transport) => {
    setIsSigning(true);
    try {
      const signedPsbt = await parsedPsbt?.getSignedPsbtBase64({
        finalize: payload.broadcast,
        ledgerTransport,
        allowedSigHash: magicEdenPsbt && runeId ? [SigHash.SINGLE_ANYONECANPAY] : undefined,
      });
      const response = await confirmSignPsbt(signedPsbt);
      trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
        protocol: 'bitcoin',
        action: 'sign-psbt',
        wallet_type: selectedAccount?.accountType || 'software',
      });
      if (ledgerTransport) {
        await ledgerTransport.close();
      }
      if (signedPsbt && magicEdenPsbt && runeId) {
        return await submitRuneSellPsbt(signedPsbt, location.state.selectedRune?.name ?? '')
          .then((res) => {
            if (res.orderIds) {
              navigate('/tx-status', {
                state: {
                  runeListed: location.state.selectedRune,
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
      if (payload.broadcast) {
        navigate('/tx-status', {
          state: {
            txid: response?.txId,
            currency: 'BTC',
            error: '',
            browserTx: true,
          },
        });
      } else {
        window.close();
      }
    } catch (err) {
      setIsSigning(false);
      if (err instanceof Error) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle: !payload.broadcast ? t('PSBT_CANT_SIGN_ERROR_TITLE') : '',
            error: err.message,
            browserTx: true,
          },
        });
      }
    }
    setIsSigning(false);
  };

  const onCancel = () => {
    if (magicEdenPsbt) {
      navigate(`/coinDashboard/FT?ftKey=${runeId}&protocol=runes`);
    } else {
      cancelSignPsbt();
      window.close();
    }
  };

  const onCloseClick = () => {
    onCloseError(validationError?.error || '');
    window.close();
  };

  if (validationError) {
    return (
      <RequestError
        error={validationError.error}
        errorTitle={validationError.errorTitle}
        onClose={onCloseClick}
      />
    );
  }

  return (
    <ConfirmBtcTransaction
      summary={summary}
      runeSummary={runeSummary}
      isLoading={isLoading}
      isSubmitting={isSigning}
      isBroadcast={payload.broadcast}
      confirmText={t('CONFIRM')}
      cancelText={t('CANCEL')}
      onCancel={onCancel}
      onConfirm={onConfirm}
      onBackClick={
        isInAppPsbt
          ? () => navigate(`/list-rune/${runeId}`, { state: location.state.listRunesState })
          : undefined
      }
      hideBottomBar
      showAccountHeader={!isInAppPsbt}
    />
  );
}

export default SignPsbtRequest;
