import { getPopupPayload } from '@common/utils/popup';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
import { sendUserRejectionMessage } from '@common/utils/rpc/responseMessages/errors';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useTransactionContext from '@hooks/useTransactionContext';
import { TransportWebUSB } from '@keystonehq/hw-transport-webusb';
import { RpcErrorCode, sendInscriptionsSchema } from '@sats-connect/core';
import { type TransactionSummary } from '@screens/sendBtc/helpers';
import { btcTransaction, type AccountType, type Transport } from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';
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

  const generateTransferTxAndSummary = async (desiredFeeRate: number) => {
    const tx = await btcTransaction.sendOrdinalsWithSplit(
      txContext,
      transfers.map((transfer) => ({
        toAddress: transfer.address,
        inscriptionId: transfer.inscriptionId,
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

  const confirmOrdinalsTransferRequest = async (
    type?: AccountType,
    transport?: Transport | TransportWebUSB,
  ) => {
    try {
      setIsExecuting(true);
      const txid = await transaction?.broadcast({
        ...(type === 'ledger' && {
          ledgerTransport: transport as Transport,
        }),
        ...(type === 'keystone' && {
          keystoneTransport: transport as TransportWebUSB,
        }),
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
    setFeeRate,
    getFeeForFeeRate,
    confirmOrdinalsTransferRequest,
    cancelOrdinalsTransferRequest,
  };
};

export default useSendInscriptions;
