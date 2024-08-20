import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import useWalletSelector from '@hooks/useWalletSelector';
import type { SignMultiplePsbtPayload, SignMultipleTransactionOptions } from '@sats-connect/core';
import { signPsbt, type InputToSign } from '@secretkeylabs/xverse-core';
import { decodeToken } from 'jsontokens';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import useSeedVault from './useSeedVault';

const useSignBatchPsbtTx = () => {
  const { accountsList, network } = useWalletSelector();
  const location = useLocation();
  const locationState = useMemo(() => location.state || {}, []);
  const { search } = location;
  const { getSeed } = useSeedVault();
  const params = new URLSearchParams(search);
  const inApp = params.get('signBatchPsbtsInApp') ?? false;
  const requestToken = params.get('signBatchPsbtRequest') ?? '';

  const request = useMemo(
    () =>
      inApp ? locationState : (decodeToken(requestToken) as any as SignMultipleTransactionOptions),
    [requestToken],
  );
  const tabId = params.get('tabId') ?? '0';

  const confirmSignPsbt = async (psbt: SignMultiplePsbtPayload) => {
    const txId = '';
    const seedPhrase = await getSeed();
    const signingResponse = await signPsbt(
      seedPhrase,
      accountsList,
      psbt.inputsToSign || [],
      psbt.psbtBase64,
      false,
      network.type,
    );

    return {
      txId,
      signingResponse,
    };
  };

  const cancelSignPsbt = () => {
    const signingMessage = {
      source: MESSAGE_SOURCE,
      method: SatsConnectMethods.signBatchPsbtResponse,
      payload: { signBatchPsbtRequest: requestToken, signBatchPsbtResponse: 'cancel' },
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
    selectedRune: locationState.selectedRune,
    minPriceSats: locationState.minPriceSats,
  };
};

export default useSignBatchPsbtTx;
