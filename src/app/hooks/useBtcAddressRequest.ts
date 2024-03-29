import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';
import useWalletSelector from '@hooks/useWalletSelector';
import { decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';
import {
  Address,
  AddressPurpose,
  AddressType,
  GetAddressOptions,
  GetAddressResponse,
} from 'sats-connect';

const useBtcAddressRequest = () => {
  const {
    btcAddress,
    ordinalsAddress,
    btcPublicKey,
    ordinalsPublicKey,
    stxAddress,
    stxPublicKey,
    selectedAccount,
  } = useWalletSelector();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('addressRequest') ?? '';
  const request = decodeToken(requestToken) as any as GetAddressOptions;
  const tabId = params.get('tabId') ?? '0';
  const origin = params.get('origin') ?? '';

  const approveBtcAddressRequest = () => {
    const addressesResponse: Address[] = request.payload.purposes.map((purpose: AddressPurpose) => {
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
    const response: GetAddressResponse = {
      addresses: addressesResponse,
    };
    const addressMessage = {
      source: MESSAGE_SOURCE,
      method: ExternalSatsMethods.getAddressResponse,
      payload: { addressRequest: requestToken, addressResponse: response },
    };
    chrome.tabs.sendMessage(+tabId, addressMessage);
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
    origin,
    requestToken,
    approveBtcAddressRequest,
    cancelAddressRequest,
  };
};

export default useBtcAddressRequest;
