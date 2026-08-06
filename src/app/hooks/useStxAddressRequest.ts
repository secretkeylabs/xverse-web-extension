import { MESSAGE_SOURCE } from '@common/types/message-types';
import { useApprovalSearchParams } from '@common/utils/popup/useApprovalSearchParams';
import { sendGetAddressesSuccessResponseMessage } from '@common/utils/rpc/responseMessages/stacks';
import useWalletSelector from '@hooks/useWalletSelector';
import { AddressPurpose, AddressType, type GetAddressOptions } from '@sats-connect/core';
import { decodeToken } from 'jsontokens';
import { useCallback, useMemo } from 'react';
import useSelectedAccount from './useSelectedAccount';

const useStxAddressRequest = () => {
  const approvalParams = useApprovalSearchParams();
  const params = approvalParams.status === 'ready' ? approvalParams.params : new URLSearchParams();

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
    () =>
      approvalParams.status === 'ready' && requestToken
        ? (decodeToken(requestToken) as any as GetAddressOptions)
        : (null as any),
    [approvalParams.status, requestToken],
  );

  const approveStxAddressRequest = useCallback(() => {
    const addressesResponse = [
      {
        address: stxAddress,
        publicKey: stxPublicKey,
        addressType: AddressType.stacks,
        purpose: AddressPurpose.Stacks,
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

    if (rpcMethod === 'stx_getAddresses') {
      sendGetAddressesSuccessResponseMessage({
        tabId,
        messageId,
        result: response,
      });
      return;
    }

    chrome.tabs.sendMessage(+tabId, addressMessage);
  }, [stxAddress, stxPublicKey, requestToken, tabId, messageId, rpcMethod]);
  const cancelAddressRequest = useCallback(() => {
    const addressMessage = {
      source: MESSAGE_SOURCE,
      method: 'stx_getAddresses',
      payload: { addressRequest: requestToken, addressResponse: 'cancel' },
    };
    chrome.tabs.sendMessage(+tabId, addressMessage);
  }, [requestToken, tabId]);

  const loading = approvalParams.status === 'loading';
  const error = approvalParams.status === 'error' ? approvalParams.error : undefined;

  if (rpcMethod === 'stx_getAddresses') {
    return {
      loading,
      error,
      payload: { network },
      tabId,
      origin,
      requestToken,
      approveStxAddressRequest,
      cancelAddressRequest,
    };
  }

  return {
    loading,
    error,
    payload: request?.payload,
    tabId,
    origin,
    requestToken,
    approveStxAddressRequest,
    cancelAddressRequest,
  };
};

export default useStxAddressRequest;
