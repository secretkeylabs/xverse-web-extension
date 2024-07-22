import ConfirmBitcoinTransaction from '@components/confirmBtcTransaction';
import RequestError from '@components/requests/requestError';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  btcTransaction,
  parseSummaryForRunes,
  type ExecuteOrderRequest,
  type PlaceOrderResponse,
  type RuneSummary,
} from '@secretkeylabs/xverse-core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useExecuteOrder from './useExecuteOrder';

// TODO: export this from core
type PSBTSummary = Awaited<ReturnType<btcTransaction.EnhancedPsbt['getSummary']>>;

type Props = {
  orderInfo: { order: PlaceOrderResponse; providerCode: ExecuteOrderRequest['providerCode'] };
  onClose: () => void;
  onConfirm: () => void;
};

export default function PsbtConfirmation({ orderInfo, onClose, onConfirm }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [summary, setSummary] = useState<PSBTSummary | undefined>();
  const [runeSummary, setRuneSummary] = useState<RuneSummary | undefined>(undefined);
  const [validationError, setValidationError] = useState<{
    error: string;
    errorTitle: string;
  } | null>(null);

  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { btcAddress, ordinalsAddress, btcPublicKey, ordinalsPublicKey } = useSelectedAccount();
  const txnContext = useTransactionContext();
  const { network } = useWalletSelector();
  const { executeOrder, error: executeOrderError } = useExecuteOrder();

  const parsedPsbt = useMemo(() => {
    try {
      return new btcTransaction.EnhancedPsbt(txnContext, orderInfo.order.psbt);
    } catch (err) {
      return undefined;
    }
  }, [orderInfo.order.psbt, txnContext]);

  useEffect(() => {
    if (executeOrderError) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          errorTitle: '',
          error: executeOrderError,
          browserTx: true,
        },
      });
    }
  }, [executeOrderError]);

  useEffect(() => {
    if (!parsedPsbt) return;

    parsedPsbt
      .getSummary()
      .then(async (txSummary) => {
        setSummary(txSummary);
        setRuneSummary(await parseSummaryForRunes(txnContext, txSummary, network.type));
        setIsLoading(false);
      })
      .catch((err) => {
        setValidationError({
          error: JSON.stringify(err),
          errorTitle: t('PSBT_CANT_PARSE_ERROR_TITLE'),
        });
      });
  }, [parsedPsbt]);

  const handleConfirm = async () => {
    setIsSigning(true);
    try {
      // TODO: add ledger support
      const signedPsbt = await parsedPsbt?.getSignedPsbtBase64({ finalize: false });

      if (!signedPsbt) {
        throw new Error(t('PSBT_CANT_SIGN_ERROR_TITLE'));
      }

      const executeOrderRequest = {
        providerCode: orderInfo.providerCode,
        orderId: orderInfo.order.orderId,
        psbt: signedPsbt,
        btcAddress,
        btcPubKey: btcPublicKey,
        ordAddress: ordinalsAddress,
        ordPubKey: ordinalsPublicKey,
      };

      const executeOrderResponse = await executeOrder(executeOrderRequest);

      if (!executeOrderResponse) {
        return setIsSigning(false);
      }

      onConfirm();

      setIsSigning(false);
      navigate('/tx-status', {
        state: {
          txid: executeOrderResponse.txid,
          currency: 'BTC',
          error: '',
          browserTx: true,
        },
      });
    } catch (err) {
      setIsSigning(false);
      if (err instanceof Error) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle: '',
            error: err.message,
            browserTx: true,
          },
        });
      }
    }
  };

  const onCancel = () => {
    navigate('/');
  };

  if (validationError) {
    return (
      <RequestError
        error={validationError.error}
        errorTitle={validationError.errorTitle}
        onClose={onClose}
      />
    );
  }

  return (
    <ConfirmBitcoinTransaction
      inputs={summary?.inputs ?? []}
      outputs={summary?.outputs ?? []}
      feeOutput={summary?.feeOutput}
      showCenotaphCallout={!!summary?.runeOp?.Cenotaph?.flaws}
      runeSummary={runeSummary}
      isLoading={isLoading}
      isSubmitting={isSigning}
      isBroadcast
      isFinal={summary?.isFinal}
      hasSigHashSingle={summary?.hasSigHashSingle}
      hasSigHashNone={summary?.hasSigHashNone}
      confirmText={t('CONFIRM')}
      cancelText={t('CANCEL')}
      onCancel={onCancel}
      onConfirm={handleConfirm}
      onBackClick={onClose}
      hideBottomBar
      showAccountHeader={false}
    />
  );
}
