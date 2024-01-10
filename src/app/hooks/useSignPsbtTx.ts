import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';
import useWalletSelector from '@hooks/useWalletSelector';
import { InputToSign, psbtBase64ToHex, signPsbt } from '@secretkeylabs/xverse-core';
import { decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';
import { SignTransactionOptions } from 'sats-connect';
import useBtcClient from './useBtcClient';
import useSeedVault from './useSeedVault';

const useSignPsbtTx = () => {
  const { accountsList, network } = useWalletSelector();
  const { search } = useLocation();
  const { getSeed } = useSeedVault();
  const params = new URLSearchParams(search);
  const requestToken = params.get('signPsbtRequest') ?? '';
  const request = decodeToken(requestToken) as any as SignTransactionOptions;
  const tabId = params.get('tabId') ?? '0';
  const btcClient = useBtcClient();

  const confirmSignPsbt = async (signingResponseOverride?: string) => {
    let signingResponse = signingResponseOverride;

    if (!signingResponse) {
      const seedPhrase = await getSeed();
      signingResponse = await signPsbt(
        seedPhrase,
        accountsList,
        request.payload.inputsToSign,
        request.payload.psbtBase64,
        request.payload.broadcast,
        network.type,
      );
    }

    let txId: string = '';
    if (request.payload.broadcast) {
      const txHex = psbtBase64ToHex(signingResponse);
      const response = await btcClient.sendRawTransaction(txHex);
      txId = response.tx.hash;
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

  const getSigningAddresses = (inputsToSign: InputToSign[]) => {
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
