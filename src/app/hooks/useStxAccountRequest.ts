import { MESSAGE_SOURCE } from '@common/types/message-types';

import { sendUserRejectionMessage } from '@common/utils/rpc/responseMessages/errors';
import { sendGetAccountsSuccessResponseMessage } from '@common/utils/rpc/responseMessages/stacks';
import useWalletSelector from '@hooks/useWalletSelector';
import type { GetAddressOptions } from '@sats-connect/core';
import { base58 } from '@scure/base';
import { bip32, bip39 } from '@secretkeylabs/xverse-core';
import { decodeToken } from 'jsontokens';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import useSeedVault from './useSeedVault';
import useSelectedAccount from './useSelectedAccount';

const GAIA_HUB_URL = 'https://hub.hiro.so';

const useStxAccountRequest = () => {
  // Params
  const { search } = useLocation();
  const params = new URLSearchParams(search);

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
    () => (requestToken ? (decodeToken(requestToken) as any as GetAddressOptions) : (null as any)),
    [requestToken],
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
