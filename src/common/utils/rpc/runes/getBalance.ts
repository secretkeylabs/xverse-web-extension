import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { RpcErrorCode, type runesGetBalanceRequestMessage } from '@sats-connect/core';
import { getRunesClient } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '../helpers';

const handleGetRunesBalance = async (
  message: runesGetBalanceRequestMessage,
  port: chrome.runtime.Port,
) => {
  const tabId = getTabIdFromPort(port);

  const {
    selectedAccountIndex,
    selectedAccountType,
    accountsList: softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
    network,
  } = rootStore.store.getState().walletState;

  const existingAccount = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
  });

  if (!existingAccount) {
    sendRpcResponse(
      tabId,
      makeRPCError(message.id, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: 'Could not find selected account.',
      }),
    );
    return;
  }

  const runesApi = getRunesClient(network.type);

  try {
    const runesBalances = await runesApi.getRuneBalances(
      existingAccount.btcAddresses.taproot.address,
    );
    sendRpcResponse(
      tabId,
      makeRpcSuccessResponse<'runes_getBalance'>(message.id, {
        balances: runesBalances.map((runeBalance) => ({
          ...runeBalance,
          amount: runeBalance.amount.toString(),
        })),
      }),
    );
  } catch (error) {
    sendRpcResponse(
      tabId,
      makeRPCError(message.id, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: (error as any).message,
      }),
    );
  }
};

export default handleGetRunesBalance;
