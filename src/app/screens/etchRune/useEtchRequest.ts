import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
import useOrdinalsServiceApi from '@hooks/apiClients/useOrdinalsServiceApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import { RpcErrorCode, type Params } from '@sats-connect/core';
import { generateTransaction, type TransactionBuildPayload } from '@screens/sendBtc/helpers';
import type { KeystoneTransport, LedgerTransport } from '@secretkeylabs/xverse-core';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SuperJSON from 'superjson';

const useEtchRequestRequestParams = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tabId = params.get('tabId') ?? '0';
  const requestId = params.get('requestId') ?? '';
  const payloadToken = params.get('payload') ?? '';

  const payload = SuperJSON.parse<Params<'runes_etch'>>(payloadToken);
  const etchRequest = payload;
  // network is not needed in the etch request and the api will use the current network
  // we need to remove it because the api will throw an error if it's present
  delete etchRequest.network;

  return { etchRequest, tabId, requestId, network: payload.network };
};

const useEtchRequest = () => {
  const { etchRequest, requestId, tabId } = useEtchRequestRequestParams();
  const selectedAccount = useSelectedAccount();
  const txContext = useTransactionContext();
  const ordinalsServiceApi = useOrdinalsServiceApi();
  const [etchError, setEtchError] = useState<{
    code: number | undefined;
    message: string;
  } | null>(null);
  const [feeRate, setFeeRate] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [orderTx, setOrderTx] = useState<TransactionBuildPayload | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const createOrderFundingTx = async (
    desiredFeeRate: number,
    fundingAmount: number,
    recipientAddress: string,
  ) => {
    const fundingTx = await generateTransaction(
      txContext,
      recipientAddress,
      BigInt(fundingAmount),
      desiredFeeRate,
    );
    return fundingTx;
  };

  const createEtchOrder = async () => {
    try {
      const order = await ordinalsServiceApi.createEtchOrder(etchRequest);
      return {
        data: order,
      };
    } catch (err) {
      const errorResponse = makeRPCError(requestId, {
        code: RpcErrorCode.INVALID_REQUEST,
        message: JSON.stringify((err as any).response.data),
      });
      setEtchError(errorResponse.error);
      sendRpcResponse(+tabId, errorResponse);
      return {
        error: errorResponse,
      };
    }
  };

  const handleEtch = async () => {
    try {
      const { data, error } = await createEtchOrder();
      if (!error) {
        setOrderId(data.orderId);
        setFeeRate(etchRequest.feeRate.toString());
        const fundingTx = await createOrderFundingTx(
          etchRequest.feeRate,
          data.fundAmount,
          data.fundAddress,
        );
        if (!fundingTx.summary) {
          const errorResponse = makeRPCError(requestId, {
            code: RpcErrorCode.INTERNAL_ERROR,
            message: 'Insufficient Funds',
          });
          setEtchError(errorResponse.error);
          sendRpcResponse(+tabId, errorResponse);
          return;
        }
        setOrderTx(fundingTx);
      }
    } catch (err) {
      const errorResponse = makeRPCError(requestId, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: JSON.stringify(err),
      });
      setEtchError(errorResponse.error);
      sendRpcResponse(+tabId, errorResponse);
    }
  };

  const payAndConfirmEtchRequest = async (options?: {
    ledgerTransport?: LedgerTransport;
    keystoneTransport?: KeystoneTransport;
  }) => {
    try {
      setIsExecuting(true);
      const txid = await orderTx?.transaction.broadcast({
        ...options,
        rbfEnabled: false,
      });
      if (!txid) {
        const response = makeRPCError(requestId, {
          code: RpcErrorCode.INTERNAL_ERROR,
          message: 'Failed to broadcast transaction',
        });
        sendRpcResponse(+tabId, response);
        return;
      }
      await ordinalsServiceApi.executeEtch(orderId, txid);
      const etchRequestResponse = makeRpcSuccessResponse<'runes_etch'>(requestId, {
        fundingAddress: txContext.paymentAddress.address,
        fundTransactionId: txid,
        orderId,
      });
      sendRpcResponse(+tabId, etchRequestResponse);
      return txid;
    } catch (err) {
      const errorResponse = makeRPCError(requestId, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: JSON.stringify((err as any).response.data),
      });
      setEtchError(errorResponse.error);
      sendRpcResponse(+tabId, errorResponse);
    } finally {
      setIsExecuting(false);
    }
  };

  const cancelEtchRequest = async () => {
    const response = makeRPCError(requestId, {
      code: RpcErrorCode.USER_REJECTION,
      message: 'Etching request cancelled',
    });
    sendRpcResponse(+tabId, response);
  };

  return {
    etchRequest,
    orderTx,
    etchError,
    feeRate,
    isExecuting,
    handleEtch,
    payAndConfirmEtchRequest,
    cancelEtchRequest,
  };
};

export default useEtchRequest;
