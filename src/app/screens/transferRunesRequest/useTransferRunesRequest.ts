import { getPopupPayload } from '@common/utils/popup';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
import { sendUserRejectionMessage } from '@common/utils/rpc/responseMessages/errors';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useTransactionContext from '@hooks/useTransactionContext';
import { RpcErrorCode, transferRunesSchema } from '@sats-connect/core';
import { type TransactionSummary } from '@screens/sendBtc/helpers';
import { btcTransaction, runesTransaction, type Transport } from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';
import * as v from 'valibot';

const useTransferRunesRequest = () => {
  const [error, popupPayloadTransferRunes] = getPopupPayload((data) =>
    v.parse(transferRunesSchema, data),
  );
  if (!popupPayloadTransferRunes) {
    throw new Error('Invalid payload');
  }

  return { popupPayloadTransferRunes, error };
};

const useTransferRunes = () => {
  const [txError, setTxError] = useState<{
    code: number | undefined;
    message: string;
  } | null>(null);
  const [feeRate, setFeeRate] = useState<string>('');
  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [summary, setSummary] = useState<TransactionSummary | undefined>();
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    popupPayloadTransferRunes: {
      context: { tabId },
      data: {
        params: { recipients },
        id,
      },
    },
  } = useTransferRunesRequest();
  const { data: btcFeeRates } = useBtcFeeRate();
  const txContext = useTransactionContext();

  const generateTransferTxAndSummary = async (desiredFeeRate: number) => {
    const tx = await runesTransaction.sendRunes(
      txContext,
      recipients.map((recipient) => ({
        address: recipient.address,
        runName: recipient.runeName,
        amount: recipient.amount
      })),
      Number(desiredFeeRate),
    );
    const txSummary = await tx.getSummary();
    return { tx, txSummary };
  };

  const buildTx = async (desiredFeeRate: number | undefined) => {
    try {
      if (!desiredFeeRate) return;
      setIsLoading(true);
      const { tx, txSummary } = await generateTransferTxAndSummary(desiredFeeRate);
      setFeeRate(desiredFeeRate.toString());
      setTransaction(tx);
      setSummary(txSummary);
    } catch (e) {
      setTransaction(undefined);
      setSummary(undefined);
      setTxError({
        code: RpcErrorCode.INTERNAL_ERROR,
        message: (e as any).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFeeForFeeRate = async (desiredFeeRate: number): Promise<number | undefined> => {
    const { txSummary } = await generateTransferTxAndSummary(desiredFeeRate);
    if (txSummary) return Number(txSummary.fee);

    return undefined;
  };

  useEffect(() => {
    let initialFeeRate: number | undefined = Number.parseInt(feeRate, 10);
    if (Number.isNaN(initialFeeRate)) {
      initialFeeRate = btcFeeRates?.priority;
    }

    buildTx(initialFeeRate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeRate, btcFeeRates?.priority]);

  const confirmRunesTransferRequest = async (ledgerTransport?: Transport) => {
    try {
      setIsExecuting(true);
      const txid = await transaction?.broadcast({
        ledgerTransport,
        rbfEnabled: false,
      });
      if (!txid) {
        const response = makeRPCError(id, {
          code: RpcErrorCode.INTERNAL_ERROR,
          message: 'Failed to broadcast transaction',
        });
        sendRpcResponse(+tabId, response);
        return;
      }
      const runesTransferResponse = makeRpcSuccessResponse<'runes_transfer'>(id, {
        txid,
      });
      sendRpcResponse(+tabId, runesTransferResponse);
      return txid;
    } catch (err) {
      const errorResponse = makeRPCError(id, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: JSON.stringify((err as any).response.data),
      });
      setTxError(errorResponse.error);
      sendRpcResponse(+tabId, errorResponse);
    } finally {
      setIsExecuting(false);
    }
  };

  const cancelRunesTransferRequest = async () => {
    sendUserRejectionMessage({ tabId: +tabId, messageId: id });
  };

  return {
    transaction,
    summary,
    txError,
    feeRate,
    isLoading,
    isExecuting,
    setFeeRate,
    getFeeForFeeRate,
    confirmRunesTransferRequest,
    cancelRunesTransferRequest,
  };
};

export default useTransferRunes;
