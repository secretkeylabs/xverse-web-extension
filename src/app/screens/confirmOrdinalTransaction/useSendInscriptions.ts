import { getPopupPayload } from '@common/utils/popup';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
import { sendUserRejectionMessage } from '@common/utils/rpc/responseMessages/errors';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useTransactionContext from '@hooks/useTransactionContext';
import { RpcErrorCode, sendInscriptionsSchema } from '@sats-connect/core';
import { type TransactionSummary } from '@screens/sendBtc/helpers';
import { btcTransaction, type Transport } from '@secretkeylabs/xverse-core';
import { useCallback, useState } from 'react';
import * as v from 'valibot';

const useSendInscriptionsRequest = () => {
  const [error, popupPayloadSendInscriptions] = getPopupPayload((data) =>
    v.parse(sendInscriptionsSchema, data),
  );
  if (!popupPayloadSendInscriptions) {
    throw new Error('Invalid payload');
  }

  return { popupPayloadSendInscriptions, error };
};

const useSendInscriptions = () => {
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
    popupPayloadSendInscriptions: {
      context: { tabId },
      data: {
        params: { transfers },
        id,
      },
    },
  } = useSendInscriptionsRequest();
  const { data: btcFeeRates } = useBtcFeeRate();
  const txContext = useTransactionContext();

  const generateTransferTxAndSummary = useCallback(
    async (desiredFeeRate: number) => {
      const tx = await btcTransaction.sendOrdinalsWithSplit(
        txContext,
        transfers.map((transfer) => ({
          toAddress: transfer.address,
          inscriptionId: transfer.inscriptionId,
        })),
        Number(desiredFeeRate),
      );
      const txSummary = await tx.getSummary();
      setFeeRate(desiredFeeRate.toString());
      setTransaction(tx);
      setSummary(txSummary);
      return { transaction: tx, summary: txSummary };
    },
    [transfers, txContext],
  );

  const buildTx = useCallback(async () => {
    try {
      setIsLoading(true);
      const initialFeeRate = +feeRate || btcFeeRates?.priority;
      if (!initialFeeRate) return;
      await generateTransferTxAndSummary(initialFeeRate);
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
  }, [feeRate, generateTransferTxAndSummary, btcFeeRates]);

  const changeFeeRate = async (desiredFeeRate: number): Promise<number | undefined> => {
    const { summary: tempSummary } = await generateTransferTxAndSummary(desiredFeeRate);
    if (tempSummary) return Number(tempSummary.fee);

    return undefined;
  };

  const confirmOrdinalsTransferRequest = async (ledgerTransport?: Transport) => {
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
      const mintRequestResponse = makeRpcSuccessResponse<'ord_sendInscriptions'>(id, {
        txid,
      });
      sendRpcResponse(+tabId, mintRequestResponse);
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

  const cancelOrdinalsTransferRequest = async () => {
    sendUserRejectionMessage({ tabId: +tabId, messageId: id });
  };

  return {
    transaction,
    summary,
    txError,
    feeRate,
    isLoading,
    isExecuting,
    buildTx,
    setFeeRate,
    changeFeeRate,
    confirmOrdinalsTransferRequest,
    cancelOrdinalsTransferRequest,
  };
};

export default useSendInscriptions;
