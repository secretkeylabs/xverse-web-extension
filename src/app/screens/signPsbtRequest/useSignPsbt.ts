import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { getLegacyApprovalParams } from '@common/utils/popup';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  BitcoinNetworkType,
  RpcErrorCode,
  type Return,
  type SignTransactionOptions,
  type SignTransactionPayload,
} from '@sats-connect/core';
import { base64 } from '@scure/base';
import * as btc from '@scure/btc-signer';
import { btcTransaction, type InputToSign, type SettingsNetwork } from '@secretkeylabs/xverse-core';
import { decodeToken } from 'jsontokens';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useBtcClient from '../../hooks/apiClients/useBtcClient';

type SignPsbtParamsState = {
  loading: boolean;
  tabId: string;
  requestId: string;
  payload?: SignTransactionPayload;
  requestToken: string | null;
  error?: string;
};

const buildPayloadFromParams = (
  params: Record<string, string>,
  network: SettingsNetwork,
  locationState: unknown,
): Pick<SignPsbtParamsState, 'payload' | 'requestToken' | 'tabId' | 'requestId'> => {
  const tabId = params.tabId ?? '0';
  const requestId = params.requestId ?? '';
  const token = params.signPsbtRequest ?? '';
  const magicEdenPsbt = params.magicEdenPsbt ?? '';

  if (token) {
    const request = decodeToken(token) as any as SignTransactionOptions;
    return {
      payload: request.payload,
      requestToken: token,
      tabId,
      requestId,
    };
  }

  if (magicEdenPsbt) {
    const { payload: magicEdenPayload } = (locationState ?? {}) as { payload?: SignTransactionPayload };
    return {
      payload: magicEdenPayload,
      requestToken: null,
      tabId,
      requestId,
    };
  }

  const signInputs = JSON.parse(params.signInputs ?? '{}') as Record<string, number[]>;
  const inputsToSign: InputToSign[] = Object.keys(signInputs).map((address) => ({
    address,
    signingIndexes: signInputs[address],
  }));
  const rpcPayload: SignTransactionPayload = {
    psbtBase64: params.psbt ?? '',
    inputsToSign,
    // Strict parse — Boolean("false") === true was a footgun (L-01).
    broadcast: params.broadcast === 'true',
    message: params.message ?? '',
    network: {
      type: BitcoinNetworkType[network.type],
    },
  };
  return {
    payload: rpcPayload,
    requestToken: null,
    tabId,
    requestId,
  };
};

const useSignPsbtParams = (network: SettingsNetwork): SignPsbtParamsState => {
  const { search } = useLocation();
  const location = useLocation();
  const [state, setState] = useState<SignPsbtParamsState>({
    loading: true,
    tabId: '0',
    requestId: '',
    requestToken: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const urlParams = new URLSearchParams(search);
      const hasOpaqueId = urlParams.has('requestId');

      // Modern path: opaque requestId → SW store (no psbt in URL).
      if (hasOpaqueId) {
        const [err, legacyParams] = await getLegacyApprovalParams();
        if (cancelled) return;
        if (err || !legacyParams) {
          setState({
            loading: false,
            tabId: '0',
            requestId: '',
            requestToken: null,
            error: err?.message ?? 'Missing approval params',
          });
          return;
        }
        try {
          const built = buildPayloadFromParams(legacyParams, network, location.state);
          setState({ loading: false, ...built });
        } catch (e: any) {
          setState({
            loading: false,
            tabId: legacyParams.tabId ?? '0',
            requestId: legacyParams.requestId ?? '',
            requestToken: null,
            error: e?.message ?? 'Failed to parse approval params',
          });
        }
        return;
      }

      // Legacy in-flight fallback: params still embedded in the hash query.
      try {
        const embedded: Record<string, string> = {};
        urlParams.forEach((value, key) => {
          embedded[key] = value;
        });
        const built = buildPayloadFromParams(embedded, network, location.state);
        if (!cancelled) {
          setState({ loading: false, ...built });
        }
      } catch (e: any) {
        if (!cancelled) {
          setState({
            loading: false,
            tabId: '0',
            requestId: '',
            requestToken: null,
            error: e?.message ?? 'Failed to parse approval params',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [search, network, location.state]);

  return state;
};

const useSignPsbt = () => {
  const { network } = useWalletSelector();
  const btcClient = useBtcClient();
  const { payload, tabId, requestToken, requestId, loading, error } = useSignPsbtParams(network);

  const txnContext = useTransactionContext();

  const parsedPsbt = useMemo(() => {
    try {
      if (!payload) return;
      return new btcTransaction.EnhancedPsbt(txnContext, payload.psbtBase64, payload.inputsToSign);
    } catch (err) {
      return undefined;
    }
  }, [txnContext, payload]);

  const confirmSignPsbt = async (signingResponse: string) => {
    if (!signingResponse || !payload) return;

    let txId: string = '';

    if (payload.broadcast && signingResponse) {
      const txn = btc.Transaction.fromPSBT(base64.decode(signingResponse));
      const txHex = txn.hex;
      const response = await btcClient.sendRawTransaction(txHex);
      txId = response.tx.hash;
    }

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
  const onCloseError = (errorMessage: string) => {
    const requestError = makeRPCError(requestId, {
      code: RpcErrorCode.INTERNAL_ERROR,
      message: errorMessage,
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
    loading,
    error,
    getSigningAddresses,
    confirmSignPsbt,
    cancelSignPsbt,
    onCloseError,
  };
};

export default useSignPsbt;
