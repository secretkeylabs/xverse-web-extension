import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { accountPurposeAddresses } from '@common/utils/rpc/btc/getAddresses.utils';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
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
} from '@sats-connect/core';
import { SettingsNetwork } from '@secretkeylabs/xverse-core';
import { decodeToken } from 'jsontokens';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const useAddressRequestParams = (network: SettingsNetwork) => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tabId = params.get('tabId') ?? '0';
  const origin = params.get('origin') ?? '';
  const requestId = params.get('requestId') ?? '';
  const rpcMethod = params.get('rpcMethod') ?? '';

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
    if (rpcMethod === 'getAddresses' || rpcMethod === 'getAccounts') {
      const getAddressRpcPayload: GetAddressPayload = {
        message,
        purposes,
        network: {
          type: BitcoinNetworkType[network.type],
        },
      };
      return {
        payload: getAddressRpcPayload,
        requestToken: null,
      };
    }
    return {
      payload: {} as GetAddressPayload,
      requestToken: {},
    };
  }, []);

  return { tabId, origin, payload, requestToken, requestId, rpcMethod };
};

const useBtcAddressRequest = () => {
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const { tabId, origin, payload, requestToken, requestId, rpcMethod } =
    useAddressRequestParams(network);

  const approveBtcAddressRequest = () => {
    const addressesResponse = accountPurposeAddresses(selectedAccount, payload.purposes);
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
      if (rpcMethod === 'getAccounts') {
        const result: Return<'getAccounts'> = addressesResponse;
        const response = makeRpcSuccessResponse(requestId, result);
        sendRpcResponse(+tabId, response);
      }
      if (rpcMethod === 'getAddresses') {
        const result: Return<'getAddresses'> = {
          addresses: addressesResponse,
        };
        const response = makeRpcSuccessResponse(requestId, result);
        sendRpcResponse(+tabId, response);
      }
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
        message: `User rejected ${rpcMethod === 'getAddresses' ? 'address' : 'accounts'} request`,
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
