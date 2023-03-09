import { decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';
import useWalletSelector from '@hooks/useWalletSelector';
import { SignPsbtOptions } from 'sats-connect';
import { signPsbt } from '@secretkeylabs/xverse-core/transactions/psbt';
import { broadcastRawBtcOrdinalTransaction } from '@secretkeylabs/xverse-core/api';

import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';

const useSignPsbtTx = () => {
  const {
    seedPhrase, accountsList, network,
  } = useWalletSelector();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('signPsbtRequest') ?? '';
  const request = decodeToken(requestToken) as any as SignPsbtOptions;
  const tabId = params.get('tabId') ?? '0';

  const confirmSignPsbt = async () => {
    const signingResponse = await signPsbt(seedPhrase, accountsList, request.payload.inputsToSign, request.payload.psbtBase64, request.payload.broadcast);
    let txId: string = '';
    if (request.payload.broadcast) {
      txId = await broadcastRawBtcOrdinalTransaction(signingResponse, network.type);
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
  };

  const cancelSignPsbt = () => {
    const signingMessage = {
      source: MESSAGE_SOURCE,
      method: ExternalSatsMethods.signPsbtResponse,
      payload: { signPsbtRequest: requestToken, signPsbtResponse: 'cancel' },
    };
    chrome.tabs.sendMessage(+tabId, signingMessage);
  };

  return {
    payload: request.payload,
    tabId,
    requestToken,
    confirmSignPsbt,
    cancelSignPsbt,
  };
};

export default useSignPsbtTx;
