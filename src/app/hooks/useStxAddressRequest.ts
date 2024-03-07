import { MESSAGE_SOURCE } from '@common/types/message-types';
import useWalletSelector from '@hooks/useWalletSelector';
import { decodeToken } from 'jsontokens';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { GetAddressOptions } from 'sats-connect';

const useStxAddressRequest = () => {
  const { stxAddress, stxPublicKey } = useWalletSelector();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('addressRequest') ?? '';
  const request = useMemo(
    () => decodeToken(requestToken) as any as GetAddressOptions,
    [requestToken],
  );
  const tabId = params.get('tabId') ?? '0';
  const origin = params.get('origin') ?? '';

  const approveStxAddressRequest = useCallback(() => {
    const addressesResponse = [
      {
        address: stxAddress,
        publicKey: stxPublicKey,
      },
    ];

    const response = {
      addresses: addressesResponse,
    };
    const addressMessage = {
      source: MESSAGE_SOURCE,
      method: 'stx_getAddresses',
      payload: { addressRequest: requestToken, addressResponse: response },
    };
    chrome.tabs.sendMessage(+tabId, addressMessage);
  }, [stxAddress, stxPublicKey, requestToken, tabId]);

  const cancelAddressRequest = useCallback(() => {
    const addressMessage = {
      source: MESSAGE_SOURCE,
      method: 'stx_getAddresses',
      payload: { addressRequest: requestToken, addressResponse: 'cancel' },
    };
    chrome.tabs.sendMessage(+tabId, addressMessage);
  }, [requestToken, tabId]);

  return {
    payload: request.payload,
    tabId,
    origin,
    requestToken,
    approveStxAddressRequest,
    cancelAddressRequest,
  };
};

export default useStxAddressRequest;
