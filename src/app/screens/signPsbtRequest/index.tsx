import { makeRPCError, sendRpcResponse } from '@common/utils/rpc/helpers';
import ConfirmBitcoinTransaction from '@components/confirmBtcTransaction';
import RequestError from '@components/requests/requestError';
import { Transport, btcTransaction } from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RpcErrorCode } from 'sats-connect';
import useSignPsbt from './useSignPsbt';
import useSignPsbtValidationGate from './useSignPsbtValidationGate';

function SignPsbtRequest() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [inputs, setInputs] = useState<btcTransaction.EnhancedInput[]>([]);
  const [outputs, setOutputs] = useState<btcTransaction.EnhancedOutput[]>([]);
  const [feeOutput, setFeeOutput] = useState<btcTransaction.TransactionFeeOutput | undefined>();
  const [hasSigHashNone, setHasSigHashNone] = useState(false);

  const { payload, parsedPsbt, confirmSignPsbt, cancelSignPsbt, onCloseError, requestId, tabId } =
    useSignPsbt();
  const { validationError, setValidationError } = useSignPsbtValidationGate({
    payload,
    parsedPsbt,
  });

  useEffect(() => {
    if (!parsedPsbt) return;

    parsedPsbt
      .getSummary()
      .then((summary) => {
        const {
          feeOutput: psbtFeeOutput,
          inputs: psbtInputs,
          outputs: psbtOutputs,
          hasSigHashNone: psbtHasSigHashNone,
        } = summary;
        setFeeOutput(psbtFeeOutput);
        setInputs(psbtInputs);
        setOutputs(psbtOutputs);
        setHasSigHashNone(psbtHasSigHashNone);
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
      });

      const response = await confirmSignPsbt(signedPsbt);
      if (ledgerTransport) {
        await ledgerTransport?.close();
      }
      setIsSigning(false);
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
  };

  const onCancel = () => {
    cancelSignPsbt();
    window.close();
  };

  const onCloseClick = () => {
    onCloseError(validationError?.error || '');
    window.close();
  };

  return validationError ? (
    <RequestError
      error={validationError.error}
      errorTitle={validationError.errorTitle}
      onClose={onCloseClick}
    />
  ) : (
    <ConfirmBitcoinTransaction
      inputs={inputs}
      outputs={outputs}
      feeOutput={feeOutput}
      isLoading={isLoading}
      isSubmitting={isSigning}
      isBroadcast={payload.broadcast}
      hasSigHashNone={hasSigHashNone}
      confirmText={t('CONFIRM')}
      cancelText={t('CANCEL')}
      onCancel={onCancel}
      onConfirm={onConfirm}
      hideBottomBar
      showAccountHeader
    />
  );
}

export default SignPsbtRequest;
