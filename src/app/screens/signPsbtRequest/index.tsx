import ConfirmBitcoinTransaction from '@components/confirmBtcTransaction';
import useSignPsbtTx from '@hooks/useSignPsbtTx';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import { btcTransaction, Transport } from '@secretkeylabs/xverse-core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import getPsbtDataWithMocks from './tempMockDataUtil';
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
      return new btcTransaction.EnhancedPsbt(txnContext, payload.psbtBase64, payload.inputsToSign);
    } catch (err) {
      return undefined;
    }
  }, [txnContext, payload.psbtBase64]);

  useSignPsbtValidationGate({ payload, parsedPsbt });

  const { btcAddress, ordinalsAddress } = useWalletSelector();
  useEffect(() => {
    if (!parsedPsbt) return;

    parsedPsbt
      .getSummary()
      .then((summary) => {
        const { feeOutput: psbtFeeOutput, inputs: psbtInputs, outputs: psbtOutputs } = summary;
        // TODO: remove this section, this is only for testing
        const { inputsWithMocks, outputsWithMocks, feeOutputWithMocks } = getPsbtDataWithMocks(
          btcAddress,
          ordinalsAddress,
          psbtInputs,
          psbtOutputs,
          !psbtFeeOutput,
          psbtFeeOutput,
        );
        setFeeOutput(feeOutputWithMocks);
        setInputs(inputsWithMocks);
        setOutputs(outputsWithMocks);

        // setFeeOutput(psbtFeeOutput);
        // setInputs(psbtInputs);
        // setOutputs(psbtOutputs);
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
            txid: response.txId,
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

  return (
    <ConfirmBitcoinTransaction
      inputs={inputs}
      outputs={outputs}
      feeOutput={feeOutput}
      isLoading={isLoading}
      isSubmitting={isSigning}
      isBroadcast={payload.broadcast}
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
