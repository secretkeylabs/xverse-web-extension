import { useApprovalSearchParams } from '@common/utils/popup/useApprovalSearchParams';
import {
  BitcoinNetworkType,
  type SendBtcTransactionOptions,
  type SendBtcTransactionPayload,
} from '@sats-connect/core';
import { type SettingsNetwork } from '@secretkeylabs/xverse-core';
import { decodeToken } from 'jsontokens';
import { useMemo } from 'react';

const useBtcSendRequestPayload = (btcAddress: string, network: SettingsNetwork) => {
  const approvalParams = useApprovalSearchParams();
  const params = approvalParams.status === 'ready' ? approvalParams.params : new URLSearchParams();
  const tabId = params.get('tabId') ?? '0';
  // RPC message id (not the opaque SW store UUID).
  const requestId = params.get('requestId') ?? '';

  const { payload, requestToken } = useMemo(() => {
    if (approvalParams.status !== 'ready') {
      return { payload: undefined, requestToken: null };
    }

    const token = params.get('sendBtcRequest') ?? '';
    if (token) {
      const request = decodeToken(token) as any as SendBtcTransactionOptions;
      return {
        payload: request.payload,
        requestToken: token,
      };
    }
    const recipientsRaw = params.get('recipients');
    const recipients = recipientsRaw ? JSON.parse(recipientsRaw) : [];
    const transferRecipients =
      recipients?.map((value) => ({
        address: value.address,
        amountSats: BigInt(value.amount),
      })) ?? [];
    const rpcPayload: SendBtcTransactionPayload = {
      senderAddress: btcAddress,
      recipients: transferRecipients,
      network: { type: BitcoinNetworkType[network.type] },
    };
    return {
      payload: rpcPayload,
      requestToken: null,
    };
  }, [approvalParams.status, params, btcAddress, network]);

  return {
    loading: approvalParams.status === 'loading',
    error: approvalParams.status === 'error' ? approvalParams.error : undefined,
    payload,
    tabId,
    requestToken,
    requestId,
  };
};

export default useBtcSendRequestPayload;
