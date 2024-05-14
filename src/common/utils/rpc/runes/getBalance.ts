import { RpcErrorCode, RpcId } from '@sats-connect/core';
import { getRunesClient } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import fetchAdapter from '@vespaiach/axios-fetch-adapter';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '../helpers';

const handleGetRunesBalance = async (requestId: RpcId, tabId: number) => {
  const { ordinalsAddress, network } = rootStore.store.getState().walletState;
  const runesApi = getRunesClient(network.type, fetchAdapter);
  try {
    const runesBalances = await runesApi.getRuneBalances(ordinalsAddress);
    sendRpcResponse(
      tabId,
      makeRpcSuccessResponse<'runes_getBalance'>(requestId, {
        balances: runesBalances.map((runeBalance) => ({
          ...runeBalance,
          amount: runeBalance.amount.toString(),
        })),
      }),
    );
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
