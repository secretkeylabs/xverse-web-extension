import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
import useWalletSelector from '@hooks/useWalletSelector';
import { SettingsNetwork } from '@secretkeylabs/xverse-core';
import { decodeToken } from 'jsontokens';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Address,
  AddressPurpose,
  AddressType,
  BitcoinNetworkType,
  GetAddressOptions,
  GetAddressPayload,
  GetAddressResponse,
  Return,
  RpcErrorCode,
} from 'sats-connect';

const useAddressRequestParams = (network: SettingsNetwork) => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tabId = params.get('tabId') ?? '0';
  const origin = params.get('origin') ?? '';
  const requestId = params.get('requestId') ?? '';

  const { payload, requestToken } = useMemo(() => {
    const token = params.get('addressRequest') ?? '';
    if (token) {
      const request = decodeToken(token) as any as GetAddressOptions;

      return {
        payload: request.payload,
        requestToken: token,
      };
    }
    const pArray = params.get('purposes');
    const message = params.get('message') ?? '';
    const purposes = pArray?.split(',') as AddressPurpose[];
    const rpcPayload: GetAddressPayload = {
      message,
      purposes,
      network:
        network.type === 'Mainnet'
          ? {
              type: BitcoinNetworkType.Mainnet,
            }
          : {
              type: BitcoinNetworkType.Testnet,
            },
    };
    return {
      payload: rpcPayload,
      requestToken: null,
    };
  }, []);

  return { tabId, origin, payload, requestToken, requestId };
};

const useBtcAddressRequest = () => {
  const {
    btcAddress,
    ordinalsAddress,
    btcPublicKey,
    ordinalsPublicKey,
    stxAddress,
    stxPublicKey,
    selectedAccount,
    network,
  } = useWalletSelector();
  const { tabId, origin, payload, requestToken, requestId } = useAddressRequestParams(network);

  const approveBtcAddressRequest = () => {
    const addressesResponse: Address[] = payload.purposes.map((purpose: AddressPurpose) => {
      if (purpose === AddressPurpose.Ordinals) {
        return {
          address: ordinalsAddress,
          publicKey: ordinalsPublicKey,
          purpose: AddressPurpose.Ordinals,
          addressType: AddressType.p2tr,
        };
      }
      if (purpose === AddressPurpose.Stacks) {
        return {
          address: stxAddress,
          publicKey: stxPublicKey,
          purpose: AddressPurpose.Stacks,
          addressType: AddressType.stacks,
        };
      }
      return {
        address: btcAddress,
        publicKey: btcPublicKey,
        purpose: AddressPurpose.Payment,
        addressType:
          selectedAccount?.accountType === 'ledger' ? AddressType.p2wpkh : AddressType.p2sh,
      };
    });
    if (requestToken) {
      const response: GetAddressResponse = {
        addresses: addressesResponse,
      };
      const addressMessage = {
        source: MESSAGE_SOURCE,
        method: SatsConnectMethods.getAddressResponse,
        payload: { addressRequest: requestToken, addressResponse: response },
      };
      chrome.tabs.sendMessage(+tabId, addressMessage);
    } else {
      const result: Return<'getAddresses'> = {
        addresses: addressesResponse,
      };
      const response = makeRpcSuccessResponse(requestId, result);
      sendRpcResponse(+tabId, response);
    }
  };

  const cancelAddressRequest = () => {
    if (requestToken) {
      const addressMessage = {
        source: MESSAGE_SOURCE,
        method: SatsConnectMethods.getAddressResponse,
        payload: { addressRequest: requestToken, addressResponse: 'cancel' },
      };
      chrome.tabs.sendMessage(+tabId, addressMessage);
    } else {
      const cancelError = makeRPCError(requestId as string, {
        code: RpcErrorCode.USER_REJECTION,
        message: `User rejected address request`,
      });
      sendRpcResponse(+tabId, cancelError);
    }
  };

  return {
    payload,
    tabId,
    origin,
    requestToken,
    approveBtcAddressRequest,
    cancelAddressRequest,
  };
};

export default useBtcAddressRequest;
