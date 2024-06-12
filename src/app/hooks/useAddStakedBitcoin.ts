import { MESSAGE_SOURCE } from '@common/types/message-types';
import { sendGetAddressesSuccessResponseMessage } from '@common/utils/rpc/stx/rpcResponseMessages';
import useWalletSelector from '@hooks/useWalletSelector';
import { decodeToken } from 'jsontokens';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { GetAddressOptions } from 'sats-connect';

const useAddStakedBitcoin = () => {
  // Params
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  // Utils
  const { stxAddress, stxPublicKey, network } = useWalletSelector();

  // Related to WebBTC RPC request
  const messageId = params.get('messageId') ?? '';
  const tabId = Number(params.get('tabId')) ?? 0;
  const rpcMethod = params.get('rpcMethod') ?? '';

  // Legacy
  const origin = params.get('origin') ?? '';
  const addStakedBitcoin = params.get('addStakedBitcoin') ?? '';

  const payload = useMemo(() => {
    try {
      const jsonPayload = JSON.parse(addStakedBitcoin);
      return jsonPayload;
    } catch (e) {
      return {};
    }
  }, [addStakedBitcoin]);

  const approveAddStakedBitcoinRequest = useCallback(() => {
    chrome.tabs.sendMessage(+tabId, {
      source: MESSAGE_SOURCE,
      method: 'addStakedBitcoinResponse',
      payload: { addStakedBitcoinResponse: 'success', addStakedBitcoinRequest: addStakedBitcoin },
    });
  }, [tabId, addStakedBitcoin]);

  const cancelAddStakedBitcoinRequest = useCallback(() => {
    chrome.tabs.sendMessage(+tabId, {
      source: MESSAGE_SOURCE,
      method: 'addStakedBitcoinResponse',
      payload: { addStakedBitoinResponse: 'cancel', addStakedBitcoinRequest: addStakedBitcoin },
    });
  }, [tabId, addStakedBitcoin]);

  // if (rpcMethod === 'stx_getAddresses') {
  //   return {
  //     payload: { network },
  //     tabId,
  //     origin,
  //     requestToken,
  //     approveAddStakedBitcoinRequest,
  //     cancelAddStakedBitcoinRequest,
  //   };
  // }

  return {
    network,
    payload,
    tabId,
    origin,
    approveAddStakedBitcoinRequest,
    cancelAddStakedBitcoinRequest,
  };
};

export default useAddStakedBitcoin;