import { MESSAGE_SOURCE } from '@common/types/message-types';
import useWalletSelector from '@hooks/useWalletSelector';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const useAddLockedBitcoin = () => {
  // Params
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  // Utils
  const { network } = useWalletSelector();

  // Related to WebBTC RPC request
  const messageId = params.get('messageId') ?? '';
  const tabId = Number(params.get('tabId')) ?? 0;
  const rpcMethod = params.get('rpcMethod') ?? '';

  // Legacy
  const origin = params.get('origin') ?? '';
  const addLockedBitcoin = params.get('addLockedBitcoin') ?? '';

  const payload = useMemo(() => {
    try {
      const jsonPayload = JSON.parse(addLockedBitcoin);
      return jsonPayload;
    } catch (e) {
      return {};
    }
  }, [addLockedBitcoin]);

  const approveAddLockedBitcoinRequest = useCallback(() => {
    chrome.tabs.sendMessage(+tabId, {
      source: MESSAGE_SOURCE,
      method: 'addLockedBitcoinResponse',
      payload: { addLockedBitcoinResponse: 'success', addLockedBitcoinRequest: addLockedBitcoin },
    });
  }, [tabId, addLockedBitcoin]);

  const cancelAddLockedBitcoinRequest = useCallback(() => {
    chrome.tabs.sendMessage(+tabId, {
      source: MESSAGE_SOURCE,
      method: 'addLockedBitcoinResponse',
      payload: { addLockedBitcoinResponse: 'cancel', addLockedBitcoinRequest: addLockedBitcoin },
    });
  }, [tabId, addLockedBitcoin]);

  return {
    network,
    payload,
    tabId,
    origin,
    approveAddLockedBitcoinRequest,
    cancelAddLockedBitcoinRequest,
  };
};

export default useAddLockedBitcoin;
