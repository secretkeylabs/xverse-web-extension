import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  BitcoinNetworkType,
  Return,
  RpcErrorCode,
  SignTransactionOptions,
  SignTransactionPayload,
} from '@sats-connect/core';
import {
  InputToSign,
  SettingsNetwork,
  btcTransaction,
  psbtBase64ToHex,
  signPsbt,
} from '@secretkeylabs/xverse-core';
import { decodeToken } from 'jsontokens';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useBtcClient from '../../hooks/useBtcClient';
import useSeedVault from '../../hooks/useSeedVault';

const useSignPsbtParams = (network: SettingsNetwork) => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tabId = params.get('tabId') ?? '0';
  const requestId = params.get('requestId') ?? '';

  const { requestToken, payload } = useMemo(() => {
    const token = params.get('signPsbtRequest') ?? '';
    if (token) {
      const request = decodeToken(token) as any as SignTransactionOptions;
      return {
        payload: request.payload,
        requestToken: token,
      };
    }
    const allowedSigHash = params.get('allowedSigHash') ?? '';
    const signInputs = JSON.parse(params.get('signInputs')!) as Record<string, number[]>;
    const inputsToSign: InputToSign[] = Object.keys(signInputs).map((address) => ({
      address,
      signingIndexes: signInputs[address],
      sigHash: +allowedSigHash,
    }));
    const rpcPayload: SignTransactionPayload = {
      psbtBase64: params.get('psbt') ?? '',
      inputsToSign,
      broadcast: Boolean(params.get('broadcast')) ?? false,
      message: params.get('message') ?? '',
      network:
        network.type === 'Mainnet'
          ? {
              type: BitcoinNetworkType.Mainnet,
            }
          : {
              type: BitcoinNetworkType.Testnet,
            },
    };
    return {
      payload: rpcPayload,
      requestToken: null,
    };
  }, []);

  return { payload, tabId, requestToken, requestId };
};

const useSignPsbt = () => {
  const { accountsList, network } = useWalletSelector();
  const { getSeed } = useSeedVault();
  const btcClient = useBtcClient();
  const { payload, tabId, requestToken, requestId } = useSignPsbtParams(network);

  const txnContext = useTransactionContext();

  const parsedPsbt = useMemo(() => {
    try {
      if (!payload) return;
      return new btcTransaction.EnhancedPsbt(txnContext, payload.psbtBase64, payload.inputsToSign);
    } catch (err) {
      return undefined;
    }
  }, [txnContext, payload]);

  const confirmSignPsbt = async (signingResponseOverride?: string) => {
    let signingResponse = signingResponseOverride;
    if (!signingResponse && payload) {
      const seedPhrase = await getSeed();
      signingResponse = await signPsbt(
        seedPhrase,
        accountsList,
        payload.inputsToSign,
        payload.psbtBase64,
        payload.broadcast,
        network.type,
      );
    }

    let txId: string = '';
    if (payload.broadcast && signingResponse) {
      const txHex = psbtBase64ToHex(signingResponse);
      const response = await btcClient.sendRawTransaction(txHex);
      txId = response.tx.hash;
    }
    if (!signingResponse) return;
    if (requestToken) {
      const signingMessage = {
        source: MESSAGE_SOURCE,
        method: SatsConnectMethods.signPsbtResponse,
        payload: {
          signPsbtRequest: requestToken,
          signPsbtResponse: {
            psbtBase64: signingResponse,
            txId,
          },
        },
      };
      chrome.tabs.sendMessage(+tabId, signingMessage);
    } else {
      const result: Return<'signPsbt'> = {
        psbt: signingResponse,
        txid: txId,
      };
      const response = makeRpcSuccessResponse(requestId as string, result);
      sendRpcResponse(+tabId, response);
    }
    return {
      txId,
      signingResponse,
    };
  };

  /**
   * User cancels the sign psbt request
   */
  const cancelSignPsbt = () => {
    if (requestToken) {
      const signingMessage = {
        source: MESSAGE_SOURCE,
        method: SatsConnectMethods.signPsbtResponse,
        payload: { signPsbtRequest: requestToken, signPsbtResponse: 'cancel' },
      };
      chrome.tabs.sendMessage(+tabId, signingMessage);
    } else {
      const cancelError = makeRPCError(requestId as string, {
        code: RpcErrorCode.USER_REJECTION,
        message: 'User rejected request to sign Psbt',
      });
      sendRpcResponse(+tabId, cancelError);
    }
  };

  /**
   * User closes request validation error
   */
  const onCloseError = (error: string) => {
    const requestError = makeRPCError(requestId, {
      code: RpcErrorCode.INTERNAL_ERROR,
      message: error,
    });
    sendRpcResponse(+tabId, requestError);
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
    payload,
    parsedPsbt,
    tabId,
    requestId,
    requestToken,
    getSigningAddresses,
    confirmSignPsbt,
    cancelSignPsbt,
    onCloseError,
  };
};

export default useSignPsbt;
