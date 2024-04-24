import { RpcErrorCode, RpcId } from '@sats-connect/core';
import { getRunesClient } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import fetchAdapter from '@vespaiach/axios-fetch-adapter';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '../helpers';

const handleGetRunesBalance = async (requestId: RpcId, tabId: number) => {
  const { ordinalsAddress, network } = rootStore.store.getState().walletState;
  const runesApi = getRunesClient(network.type, fetchAdapter);
  try {
    const balance = await runesApi.getRuneBalance(ordinalsAddress);
    sendRpcResponse(tabId, makeRpcSuccessResponse(requestId, balance as any));
  } catch (error) {
    sendRpcResponse(
      tabId,
      makeRPCError(requestId, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: (error as any).message,
      }),
    );
  }
};

export default handleGetRunesBalance;
