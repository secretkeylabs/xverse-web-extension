import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext } from '@common/utils/popup';
import { getClientPermissions } from '@components/permissionsManager/utils';
import { RpcErrorCode, RpcRequestMessage } from '@sats-connect/core';
import { getRunesClient } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '../helpers';

const handleGetBalance = async (message: RpcRequestMessage, port: chrome.runtime.Port) => {
  // // Check that this client has permission to get the balance
  // const { origin } = makeContext(port);
  // // Get this client's resource access
  // const permissions = getClientPermissions(origin);
  // const {
  //   selectedAccountIndex,
  //   selectedAccountType,
  //   accountsList: softwareAccountsList,
  //   ledgerAccountsList,
  //   network,
  // } = rootStore.store.getState().walletState;
  // const existingAccount = getSelectedAccount({
  //   selectedAccountIndex,
  //   selectedAccountType,
  //   softwareAccountsList,
  //   ledgerAccountsList,
  // });
  // if (!existingAccount) {
  //   sendRpcResponse(
  //     tabId,
  //     makeRPCError(requestId, {
  //       code: RpcErrorCode.INTERNAL_ERROR,
  //       message: 'Could not find selected account.',
  //     }),
  //   );
  //   return;
  // }
  // const runesApi = getRunesClient(network.type);
  // try {
  //   const runesBalances = await runesApi.getRuneBalances(existingAccount.ordinalsAddress);
  //   sendRpcResponse(
  //     tabId,
  //     makeRpcSuccessResponse<'runes_getBalance'>(requestId, {
  //       balances: runesBalances.map((runeBalance) => ({
  //         ...runeBalance,
  //         amount: runeBalance.amount.toString(),
  //       })),
  //     }),
  //   );
  // } catch (error) {
  //   sendRpcResponse(
  //     tabId,
  //     makeRPCError(requestId, {
  //       code: RpcErrorCode.INTERNAL_ERROR,
  //       message: (error as any).message,
  //     }),
  //   );
  // }
};

export default handleGetBalance;
