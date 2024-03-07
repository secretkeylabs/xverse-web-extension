import { MESSAGE_SOURCE } from '@common/types/message-types';
import useWalletSelector from '@hooks/useWalletSelector';
import { bip32, bip39, bs58 } from '@secretkeylabs/xverse-core';
import { GAIA_HUB_URL } from '@secretkeylabs/xverse-core/constant';
import { decodeToken } from 'jsontokens';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { GetAddressOptions } from 'sats-connect';
import useSeedVault from './useSeedVault';

const useStxAccountRequest = () => {
  const { stxAddress, stxPublicKey } = useWalletSelector();
  const { getSeed } = useSeedVault();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('addressRequest') ?? '';
  const request = useMemo(
    () => decodeToken(requestToken) as any as GetAddressOptions,
    [requestToken],
  );
  const tabId = params.get('tabId') ?? '0';
  const origin = params.get('origin') ?? '';

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
    chrome.tabs.sendMessage(+tabId, addressMessage);
  }, [getSeed, stxAddress, stxPublicKey, requestToken, tabId]);

  const cancelAccountRequest = useCallback(() => {
    const addressMessage = {
      source: MESSAGE_SOURCE,
      method: 'stx_getAccounts',
      payload: { addressRequest: requestToken, addressResponse: 'cancel' },
    };
    chrome.tabs.sendMessage(+tabId, addressMessage);
  }, [requestToken, tabId]);

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
