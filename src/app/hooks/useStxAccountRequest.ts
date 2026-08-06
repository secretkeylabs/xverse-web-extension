import { MESSAGE_SOURCE } from '@common/types/message-types';

import { useApprovalSearchParams } from '@common/utils/popup/useApprovalSearchParams';
import { sendUserRejectionMessage } from '@common/utils/rpc/responseMessages/errors';
import { sendGetAccountsSuccessResponseMessage } from '@common/utils/rpc/responseMessages/stacks';
import useWalletSelector from '@hooks/useWalletSelector';
import type { GetAddressOptions } from '@sats-connect/core';
import { base58 } from '@scure/base';
import { bip32, bip39 } from '@secretkeylabs/xverse-core';
import { decodeToken } from 'jsontokens';
import { useCallback, useMemo } from 'react';
import useSeedVault from './useSeedVault';
import useSelectedAccount from './useSelectedAccount';

const GAIA_HUB_URL = 'https://hub.hiro.so';

const useStxAccountRequest = () => {
  const approvalParams = useApprovalSearchParams();
  const params = approvalParams.status === 'ready' ? approvalParams.params : new URLSearchParams();

  // Utils
  const { stxAddress, stxPublicKey } = useSelectedAccount();
  const { network } = useWalletSelector();
  const { getSeed } = useSeedVault();

  // Related to WebBTC RPC request
  const messageId = params.get('messageId') ?? '';
  const tabId = Number(params.get('tabId')) ?? 0;
  const rpcMethod = params.get('rpcMethod') ?? '';

  // Legacy
  const origin = params.get('origin') ?? '';
  const requestToken = params.get('addressRequest') ?? '';
  const request = useMemo(
    () =>
      approvalParams.status === 'ready' && requestToken
        ? (decodeToken(requestToken) as any as GetAddressOptions)
        : (null as any),
    [approvalParams.status, requestToken],
  );

  // Actions
  const approveStxAccountRequest = useCallback(async () => {
    const seedPhrase = await getSeed();
    const seed = await bip39.mnemonicToSeed(seedPhrase);
    const rootNode = bip32.fromSeed(seed);
    const identitiesKeychain = rootNode.derivePath(`m/888'/0'`);

    const identityKeychain = identitiesKeychain.deriveHardened(0);
    const appsKeyBase58 = identityKeychain.deriveHardened(0).toBase58();
    const appsKeyUint8Array = base58.decode(appsKeyBase58);
    const appsKeyHex = Buffer.from(appsKeyUint8Array).toString('hex');

    const addressesResponse = [
      {
        address: stxAddress,
        publicKey: stxPublicKey,
        gaiaHubUrl: GAIA_HUB_URL,
        gaiaAppKey: appsKeyHex,
      },
    ];

    const response = {
      addresses: addressesResponse,
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
  }, [getSeed, stxAddress, stxPublicKey, requestToken, tabId, messageId, rpcMethod]);
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
  }, [requestToken, tabId, rpcMethod, messageId]);

  const loading = approvalParams.status === 'loading';
  const error = approvalParams.status === 'error' ? approvalParams.error : undefined;

  if (rpcMethod === 'stx_getAccounts') {
    return {
      loading,
      error,
      payload: { network },
      tabId,
      origin,
      requestToken,
      approveStxAccountRequest,
      cancelAccountRequest,
    };
  }

  return {
    loading,
    error,
    payload: request?.payload,
    tabId,
    origin,
    requestToken,
    approveStxAccountRequest,
    cancelAccountRequest,
  };
};

export default useStxAccountRequest;
