import { MESSAGE_SOURCE } from '@common/types/message-types';
import {
  sendGetAccountsSuccessResponseMessage,
  sendUserRejectionMessage,
} from '@common/utils/rpc/stx/rpcResponseMessages';
import useWalletSelector from '@hooks/useWalletSelector';
import { bip32, bip39, bs58 } from '@secretkeylabs/xverse-core';
import { GAIA_HUB_URL } from '@secretkeylabs/xverse-core/constant';
import { decodeToken } from 'jsontokens';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { GetAddressOptions } from 'sats-connect';
import useSeedVault from './useSeedVault';

const useStxAccountRequest = () => {
  // Params
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  // Utils
  const { stxAddress, stxPublicKey, network } = useWalletSelector();
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
    const rootNode = bip32.fromSeed(Buffer.from(seed));
    const identitiesKeychain = rootNode.derivePath(`m/888'/0'`);

    const identityKeychain = identitiesKeychain.deriveHardened(0);
    const appsKeyBase58 = identityKeychain.deriveHardened(0).toBase58();
    const appsKeyUint8Array = bs58.decode(appsKeyBase58);
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
