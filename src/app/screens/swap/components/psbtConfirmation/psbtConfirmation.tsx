import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RequestError from '@components/requests/requestError';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import type { OrderInfo } from '@screens/swap/types';
import {
  btcTransaction,
  type ExecuteUtxoOrderRequest,
  type KeystoneTransport,
  type LedgerTransport,
} from '@secretkeylabs/xverse-core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useExecuteOrder from './useExecuteOrder';
import useExecuteUtxoOrder from './useExecuteUtxoOrder';

// TODO: export this from core
type PSBTSummary = Awaited<ReturnType<btcTransaction.EnhancedPsbt['getSummary']>>;

type Props = {
  orderInfo: OrderInfo;
  onClose: () => void;
  onConfirm: () => void;
  customExecute?: (signedPsbt: string) => void;
  customCallout?: { bodyText: string };
};

export default function PsbtConfirmation({
  orderInfo,
  onClose,
  onConfirm,
  customExecute,
  customCallout,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [summary, setSummary] = useState<PSBTSummary | undefined>();
  const [validationError, setValidationError] = useState<{
    error: string;
    errorTitle: string;
  } | null>(null);

  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const selectedAccount = useSelectedAccount();
  const { btcAddress, ordinalsAddress, btcPublicKey, ordinalsPublicKey } = selectedAccount;
  const txnContext = useTransactionContext();
  const { network } = useWalletSelector();
  const { executeOrder, error: executeOrderError } = useExecuteOrder();
  const { executeUtxoOrder, error: executeUtxoOrderError } = useExecuteUtxoOrder();

  const parsedPsbt = useMemo(() => {
    try {
      return new btcTransaction.EnhancedPsbt(txnContext, orderInfo.order.psbt);
    } catch (err) {
      return undefined;
    }
  }, [orderInfo.order.psbt, txnContext]);

  useEffect(() => {
    const error = executeOrderError ?? executeUtxoOrderError;
    if (error) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          errorTitle: '',
          error,
          browserTx: false,
        },
      });
    }
  }, [executeOrderError, executeUtxoOrderError]);

  useEffect(() => {
    if (!parsedPsbt) return;

    parsedPsbt
      .getSummary()
      .then(async (txSummary) => {
        setSummary(txSummary);
        setIsLoading(false);
      })
      .catch((err) => {
        setValidationError({
          error: JSON.stringify(err),
          errorTitle: t('PSBT_CANT_PARSE_ERROR_TITLE'),
        });
      });
  }, [parsedPsbt]);

  const handleExecuteOrder = async (signedPsbt: string) => {
    if ('orders' in orderInfo.order) {
      const executeUtxoOrderRequest: ExecuteUtxoOrderRequest = {
        providerCode: orderInfo.providerCode,
        orderId: orderInfo.order.orderId,
        psbt: signedPsbt,
        btcAddress,
        btcPubKey: btcPublicKey,
        ordAddress: ordinalsAddress,
        ordPubKey: ordinalsPublicKey,
        orders: orderInfo.order.orders,
      };
      const executeUtxoOrderResponse = await executeUtxoOrder(executeUtxoOrderRequest);
      return executeUtxoOrderResponse;
    }

    const executeOrderRequest = {
      providerCode: orderInfo.providerCode,
      orderId: orderInfo.order.orderId,
      psbt: signedPsbt,
      btcAddress,
      btcPubKey: btcPublicKey,
      ordAddress: ordinalsAddress,
      ordPubKey: ordinalsPublicKey,
      identifier: orderInfo.order.identifier,
    };

    const executeOrderResponse = await executeOrder(executeOrderRequest);
    return executeOrderResponse;
  };

  const handleConfirm = async (options?: {
    ledgerTransport?: LedgerTransport;
    keystoneTransport?: KeystoneTransport;
  }) => {
    setIsSigning(true);
    try {
      const signedPsbt = await parsedPsbt?.getSignedPsbtBase64({
        finalize: false,
        ...options,
      });

      if (!signedPsbt) {
        throw new Error(t('PSBT_CANT_SIGN_ERROR_TITLE'));
      }

      if (customExecute) {
        await customExecute(signedPsbt);
      } else {
        const orderResponse = await handleExecuteOrder(signedPsbt);

        if (!orderResponse) {
          return setIsSigning(false);
        }

        const transport = options?.ledgerTransport ?? options?.keystoneTransport;
        if (transport) {
          await transport.close();
        }

        onConfirm();

        setIsSigning(false);
        navigate('/tx-status', {
          state: {
            txid: orderResponse.txid,
            currency: 'BTC',
            error: '',
            browserTx: false,
          },
        });
      }
    } catch (err) {
      setIsSigning(false);
      if (err instanceof Error) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle: '',
            error: err.message,
            browserTx: false,
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

  const quoteExpiryCallout =
    'expiresInMilliseconds' in orderInfo.order && orderInfo.order.expiresInMilliseconds
      ? {
          bodyText: t('QUOTE_EXPIRES_IN', {
            seconds: orderInfo.order.expiresInMilliseconds / 1000,
          }),
        }
      : undefined;

  return (
    <ConfirmBtcTransaction
      summary={summary}
      isLoading={isLoading}
      isSubmitting={isSigning}
      isBroadcast
      confirmText={t('CONFIRM')}
      cancelText={t('CANCEL')}
      onCancel={onCancel}
      onConfirm={handleConfirm}
      onBackClick={onClose}
      hideBottomBar
      showAccountHeader={false}
      customCallout={customCallout || quoteExpiryCallout}
    />
  );
}
