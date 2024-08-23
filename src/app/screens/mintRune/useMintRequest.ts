import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
import useOrdinalsServiceApi from '@hooks/apiClients/useOrdinalsServiceApi';
import useRunesApi from '@hooks/apiClients/useRunesApi';
import useTransactionContext from '@hooks/useTransactionContext';
import { RpcErrorCode, type MintRunesParams, type Params } from '@sats-connect/core';
import { generateTransaction, type TransactionBuildPayload } from '@screens/sendBtc/helpers';
import { type Rune, type Transport } from '@secretkeylabs/xverse-core';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SuperJSON from 'superjson';

const useRuneMintRequestParams = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tabId = params.get('tabId') ?? '0';
  const requestId = params.get('requestId') ?? '';
  const payloadToken = params.get('payload') ?? '';

  const payload = SuperJSON.parse<Params<'runes_mint'>>(payloadToken);
  const mintRequest = payload;
  // network is not needed in the mint request and the api will use the current network
  // we need to remove it because the api will throw an error if it's present
  delete mintRequest.network;

  return { mintRequest, tabId, requestId, network: payload.network };
};

const useMintRequest = (): {
  runeInfo: Rune | null;
  mintRequest: MintRunesParams;
  orderTx: TransactionBuildPayload | null;
  mintError: { code: number | undefined; message: string } | null;
  feeRate: string;
  isExecuting: boolean;
  handleMint: () => Promise<void>;
  payAndConfirmMintRequest: (ledgerTransport?: Transport) => Promise<any>;
  cancelMintRequest: () => Promise<void>;
} => {
  const { mintRequest, requestId, tabId } = useRuneMintRequestParams();
  const txContext = useTransactionContext();
  const ordinalsServiceApi = useOrdinalsServiceApi();
  const runesApi = useRunesApi();

  const [mintError, setMintError] = useState<{
    code: number | undefined;
    message: string;
  } | null>(null);
  const [feeRate, setFeeRate] = useState<string>('');
  const [runeInfo, setRuneInfo] = useState<Rune | null>(null);
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

  const createMintOrder = async () => {
    try {
      const response = await ordinalsServiceApi.createMintOrder(mintRequest);
      return {
        data: response,
      };
    } catch (err) {
      const errorResponse = makeRPCError(requestId, {
        code: RpcErrorCode.INVALID_REQUEST,
        message: JSON.stringify((err as any).response.data),
      });
      setMintError(errorResponse.error);
      sendRpcResponse(+tabId, errorResponse);
      return {
        error: errorResponse,
      };
    }
  };

  const handleMint = async () => {
    const info = await runesApi.getRuneInfo(mintRequest.runeName);
    if (!info) {
      const errorResponse = makeRPCError(requestId, {
        code: RpcErrorCode.INVALID_PARAMS,
        message: 'Rune not found',
      });
      setMintError(errorResponse.error);
      sendRpcResponse(+tabId, errorResponse);
      return;
    }
    if (!info.mintable) {
      const errorResponse = makeRPCError(requestId, {
        code: RpcErrorCode.INVALID_PARAMS,
        message: 'Rune not Mintable',
      });
      setMintError(errorResponse.error);
      sendRpcResponse(+tabId, errorResponse);
      return;
    }
    setRuneInfo(info);
    try {
      const { data, error } = await createMintOrder();
      if (!error) {
        setOrderId(data.orderId);
        setFeeRate(mintRequest.feeRate.toString());
        const fundingTx = await createOrderFundingTx(
          mintRequest.feeRate,
          data.fundAmount,
          data.fundAddress,
        );
        if (!fundingTx.summary) {
          const errorResponse = makeRPCError(requestId, {
            code: RpcErrorCode.INTERNAL_ERROR,
            message: 'Insufficient Funds',
          });
          setMintError(errorResponse.error);
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
      setMintError(errorResponse.error);
      sendRpcResponse(+tabId, errorResponse);
    }
  };

  const payAndConfirmMintRequest = async (ledgerTransport?: Transport) => {
    try {
      setIsExecuting(true);
      const txid = await orderTx?.transaction.broadcast({
        ledgerTransport,
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
      await ordinalsServiceApi.executeMint(orderId, txid);
      const mintRequestResponse = makeRpcSuccessResponse<'runes_mint'>(requestId, {
        fundingAddress: txContext.paymentAddress.address,
        fundTransactionId: txid,
        orderId,
      });
      sendRpcResponse(+tabId, mintRequestResponse);
      return txid;
    } catch (err) {
      const errorResponse = makeRPCError(requestId, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: JSON.stringify((err as any).response.data),
      });
      setMintError(errorResponse.error);
      sendRpcResponse(+tabId, errorResponse);
    } finally {
      setIsExecuting(false);
    }
  };

  const cancelMintRequest = async () => {
    const response = makeRPCError(requestId, {
      code: RpcErrorCode.USER_REJECTION,
      message: 'Mint request cancelled',
    });
    sendRpcResponse(+tabId, response);
  };

  return {
    runeInfo,
    mintRequest,
    orderTx,
    mintError,
    feeRate,
    isExecuting,
    handleMint,
    payAndConfirmMintRequest,
    cancelMintRequest,
  };
};

export default useMintRequest;
