import ConfirmBitcoinTransaction from '@components/confirmBtcTransaction';
import useSignPsbtTx from '@hooks/useSignPsbtTx';
import useTransactionContext from '@hooks/useTransactionContext';
import { btcTransaction } from '@secretkeylabs/xverse-core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSignPsbtValidationGate from './useSignPsbtValidationGate';

function SignPsbtRequest() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [inputs, setInputs] = useState<btcTransaction.EnhancedInput[]>([]);
  const [outputs, setOutputs] = useState<btcTransaction.EnhancedOutput[]>([]);
  const [feeOutput, setFeeOutput] = useState<btcTransaction.TransactionFeeOutput | undefined>();

  const { payload, confirmSignPsbt, cancelSignPsbt } = useSignPsbtTx();
  const txnContext = useTransactionContext();
  const parsedPsbt = useMemo(() => {
    try {
      return new btcTransaction.EnhancedPsbt(txnContext, payload.psbtBase64);
    } catch (err) {
      return undefined;
    }
  }, [txnContext, payload.psbtBase64]);

  useSignPsbtValidationGate({ payload, parsedPsbt });

  useEffect(() => {
    if (!parsedPsbt) return;

    parsedPsbt
      .getSummary()
      .then((summary) => {
        const { feeOutput: psbtFeeOutput, inputs: psbtInputs, outputs: psbtOutputs } = summary;
        setFeeOutput(psbtFeeOutput);
        setInputs(psbtInputs);
        setOutputs(psbtOutputs);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle: t('PSBT_CANT_PARSE_ERROR_TITLE'),
            error: t('PSBT_CANT_PARSE_ERROR_DESCRIPTION'),
            browserTx: true,
          },
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedPsbt]);

  const onConfirm = async () => {
    setIsSigning(true);
    try {
      const allowedSighash = payload.inputsToSign
        .filter((input) => input.sigHash)
        .map((input) => input.sigHash!);

      const signedPsbt = await parsedPsbt?.getSignedPsbtBase64({
        finalize: payload.broadcast,
        allowedSighash: allowedSighash.length ? allowedSighash : undefined,
        // TODO: add ledger functionality. We need to construct the transport with the ledger modals we use elsewhere
        // TODO: and just pass the transport here. Everything else should be automatic.
        // ledgerTransport
      });

      await confirmSignPsbt(signedPsbt);

      window.close();
    } catch (err) {
      setIsSigning(false);
      // TODO: show error to user
    }
  };

  const onCancel = () => {
    cancelSignPsbt();
    window.close();
  };

  return (
    <ConfirmBitcoinTransaction
      inputs={inputs}
      outputs={outputs}
      feeOutput={feeOutput}
      isLoading={isLoading}
      isSubmitting={isSigning}
      confirmText={t('CONFIRM')}
      cancelText={t('CANCEL')}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

export default SignPsbtRequest;
