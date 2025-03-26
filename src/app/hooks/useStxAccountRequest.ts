import { MESSAGE_SOURCE } from '@common/types/message-types';

import { getBitcoinNetworkType } from '@common/utils/rpc/helpers';
import { sendUserRejectionMessage } from '@common/utils/rpc/responseMessages/errors';
import { sendGetAccountsSuccessResponseMessage } from '@common/utils/rpc/responseMessages/stacks';
import useWalletSelector from '@hooks/useWalletSelector';
import type { GetAddressOptions, Return } from '@sats-connect/core';
import { base58, hex } from '@scure/base';
import { decodeToken } from 'jsontokens';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import useSelectedAccount from './useSelectedAccount';
import useVault from './useVault';

const GAIA_HUB_URL = 'https://hub.hiro.so';

const useStxAccountRequest = () => {
  // Params
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  // Utils
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const vault = useVault();

  // Related to WebBTC RPC request
  const messageId = params.get('messageId') ?? '';
  const tabId = Number(params.get('tabId')) ?? 0;
  const rpcMethod = params.get('rpcMethod') ?? '';

  // Legacy
  const origin = params.get('origin') ?? '';
  const requestToken = params.get('addressRequest') ?? '';
  const request = useMemo(
    () => (requestToken ? (decodeToken(requestToken) as any as GetAddressOptions) : (null as any)),
    [requestToken],
  );

  // Actions
  const approveStxAccountRequest = useCallback(async () => {
    if (selectedAccount.accountType !== 'software') {
      throw new Error('Only software wallet is supported for stx account derivation');
    }
    const { rootNode } = await vault.SeedVault.getWalletRootNode(selectedAccount.walletId);

    const appsKey = rootNode.derive(`m/888'/0'/0'/0'`);
    const appsKeyBase58 = appsKey.privateExtendedKey;
    const appsKeyUint8Array = base58.decode(appsKeyBase58);
    const appsKeyHex = hex.encode(appsKeyUint8Array);

    const addressesResponse = [
      {
        address: selectedAccount.stxAddress,
        publicKey: selectedAccount.stxPublicKey,
        gaiaHubUrl: GAIA_HUB_URL,
        gaiaAppKey: appsKeyHex,
      },
    ];

    const response: Return<'stx_getAccounts'> = {
      addresses: addressesResponse,
      network: {
        bitcoin: {
          name: getBitcoinNetworkType(network.type),
        },
        stacks: {
          name: getBitcoinNetworkType(network.type),
        },
      },
    };
    const addressMessage = {
      source: MESSAGE_SOURCE,
      method: 'stx_getAccounts',
      payload: { addressRequest: requestToken, addressResponse: response },
    };

    if (rpcMethod === 'stx_getAccounts') {
      sendGetAccountsSuccessResponseMessage({ tabId, messageId, result: response });
      return;
    }

    chrome.tabs.sendMessage(+tabId, addressMessage);
  }, [vault, selectedAccount, requestToken, tabId, messageId, rpcMethod]);
  const cancelAccountRequest = useCallback(() => {
    if (rpcMethod === 'stx_getAccounts') {
      sendUserRejectionMessage({ tabId, messageId });
      return;
    }

    const addressMessage = {
      source: MESSAGE_SOURCE,
      method: 'stx_getAccounts',
      payload: { addressRequest: requestToken, addressResponse: 'cancel' },
    };
    chrome.tabs.sendMessage(+tabId, addressMessage);
  }, [requestToken, tabId]);

  if (rpcMethod === 'stx_getAccounts') {
    return {
      payload: { network },
      tabId,
      origin,
      requestToken,
      approveStxAccountRequest,
      cancelAccountRequest,
    };
  }

  return {
    payload: request.payload,
    tabId,
    origin,
    requestToken,
    approveStxAccountRequest,
    cancelAccountRequest,
  };
};

export default useStxAccountRequest;
