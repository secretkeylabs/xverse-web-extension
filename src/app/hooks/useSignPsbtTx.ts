import { decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';
import useWalletSelector from '@hooks/useWalletSelector';
import { SignTransactionOptions } from 'sats-connect';
import {
  InputToSign,
  signPsbt,
  psbtBase64ToHex,
} from '@secretkeylabs/xverse-core/transactions/psbt';
import { broadcastRawBtcOrdinalTransaction } from '@secretkeylabs/xverse-core/api';

import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';

const useSignPsbtTx = () => {
  const { seedPhrase, accountsList, network } = useWalletSelector();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('signPsbtRequest') ?? '';
  const request = decodeToken(requestToken) as any as SignTransactionOptions;
  const tabId = params.get('tabId') ?? '0';

  const confirmSignPsbt = async () => {
    const signingResponse = await signPsbt(
      seedPhrase,
      accountsList,
      request.payload.inputsToSign,
      request.payload.psbtBase64,
      request.payload.broadcast,
      network.type
    );
    let txId: string = '';
    if (request.payload.broadcast) {
      const txHex = psbtBase64ToHex(signingResponse);
      txId = await broadcastRawBtcOrdinalTransaction(txHex, network.type);
    }
    const signingMessage = {
      source: MESSAGE_SOURCE,
      method: ExternalSatsMethods.signPsbtResponse,
      payload: {
        signPsbtRequest: requestToken,
        signPsbtResponse: {
          psbtBase64: signingResponse,
          txId,
        },
      },
    };
    chrome.tabs.sendMessage(+tabId, signingMessage);
    return {
      txId,
      signingResponse,
    };
  };

  const cancelSignPsbt = () => {
    const signingMessage = {
      source: MESSAGE_SOURCE,
      method: ExternalSatsMethods.signPsbtResponse,
      payload: { signPsbtRequest: requestToken, signPsbtResponse: 'cancel' },
    };
    chrome.tabs.sendMessage(+tabId, signingMessage);
  };

  const getSigningAddresses = (inputsToSign: Array<InputToSign>) => {
    const signingAddresses: Array<string> = [];
    inputsToSign.forEach((inputToSign) => {
      inputToSign.signingIndexes.forEach((signingIndex) => {
        signingAddresses[signingIndex] = inputToSign.address;
      });
    });
    return signingAddresses;
  };

  return {
    payload: request.payload,
    tabId,
    requestToken,
    getSigningAddresses,
    confirmSignPsbt,
    cancelSignPsbt,
  };
};

export default useSignPsbtTx;
