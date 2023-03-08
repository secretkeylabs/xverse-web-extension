import { decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';
import useWalletSelector from '@hooks/useWalletSelector';
import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';
import {
  GetAddressOptions,
  AddressPurposes,
  GetAddressResponse,
} from 'sats-connect';
import {
  BTC_PATH_WITHOUT_INDEX,
  BTC_TAPROOT_PATH_WITHOUT_INDEX,
} from '@secretkeylabs/xverse-core/constant';

const useBtcAddressRequest = () => {
  const { btcAddress, ordinalsAddress } = useWalletSelector();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('addressRequest') ?? '';
  const request = decodeToken(requestToken) as any as GetAddressOptions;
  const tabId = params.get('tabId') ?? '0';

  const approveBtcAddressRequest = () => {
    let response: GetAddressResponse;
    if (request.payload.purpose.purpose === AddressPurposes.PAYMENT) {
      response = {
        address: btcAddress,
        purpose: {
          purpose: AddressPurposes.PAYMENT,
          derivation_path: BTC_PATH_WITHOUT_INDEX,
        },
      };
      const addressMessage = {
        source: MESSAGE_SOURCE,
        method: ExternalSatsMethods.getAddressResponse,
        payload: { addressRequest: requestToken, addressResponse: response },
      };
      chrome.tabs.sendMessage(+tabId, addressMessage);
    }
    if (request.payload.purpose.purpose === AddressPurposes.ORDINALS) {
      response = {
        address: ordinalsAddress,
        purpose: {
          purpose: AddressPurposes.ORDINALS,
          derivation_path: BTC_TAPROOT_PATH_WITHOUT_INDEX,
        },
      };
      const addressMessage = {
        source: MESSAGE_SOURCE,
        method: ExternalSatsMethods.getAddressResponse,
        payload: { addressRequest: requestToken, addressResponse: response },
      };
      chrome.tabs.sendMessage(+tabId, addressMessage);
    }
  };

  const cancelAddressRequest = () => {
    const addressMessage = {
      source: MESSAGE_SOURCE,
      method: ExternalSatsMethods.getAddressResponse,
      payload: { addressRequest: requestToken, addressResponse: 'cancel' },
    };
    chrome.tabs.sendMessage(+tabId, addressMessage);
  };

  return {
    payload: request.payload,
    tabId,
    requestToken,
    approveBtcAddressRequest,
    cancelAddressRequest,
  };
};

export default useBtcAddressRequest;
