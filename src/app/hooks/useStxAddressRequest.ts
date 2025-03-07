import { MESSAGE_SOURCE } from '@common/types/message-types';
import { getBitcoinNetworkType } from '@common/utils/rpc/helpers';
import { sendGetAddressesSuccessResponseMessage } from '@common/utils/rpc/responseMessages/stacks';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  AddressPurpose,
  AddressType,
  type GetAddressOptions,
  type Return,
  type WalletType,
} from '@sats-connect/core';
import { decodeToken } from 'jsontokens';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import useSelectedAccount from './useSelectedAccount';

const useStxAddressRequest = () => {
  // Params
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  // Utils
  const { stxAddress, stxPublicKey } = useSelectedAccount();
  const { network } = useWalletSelector();

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

  const approveStxAddressRequest = useCallback(() => {
    const addressesResponse = [
      {
        address: stxAddress,
        publicKey: stxPublicKey,
        addressType: AddressType.stacks,
        purpose: AddressPurpose.Stacks,
        walletType: 'software' as WalletType,
      },
    ];

    const response: Return<'stx_getAddresses'> = {
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
      method: 'stx_getAddresses',
      payload: { addressRequest: requestToken, addressResponse: response },
    };

    if (rpcMethod === 'stx_getAddresses') {
      sendGetAddressesSuccessResponseMessage({
        tabId,
        messageId,
        result: response,
      });
      return;
    }

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

  if (rpcMethod === 'stx_getAddresses') {
    return {
      payload: { network },
      tabId,
      origin,
      requestToken,
      approveStxAddressRequest,
      cancelAddressRequest,
    };
  }

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
