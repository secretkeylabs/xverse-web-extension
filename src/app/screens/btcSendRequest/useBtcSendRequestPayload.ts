import {
  BitcoinNetworkType,
  type SendBtcTransactionOptions,
  type SendBtcTransactionPayload,
} from '@sats-connect/core';
import { type SettingsNetwork } from '@secretkeylabs/xverse-core';
import { decodeToken } from 'jsontokens';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const useBtcSendRequestPayload = (btcAddress: string, network: SettingsNetwork) => {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const tabId = params.get('tabId') ?? '0';
  const requestId = params.get('requestId') ?? '';

  const { payload, requestToken } = useMemo(() => {
    const token = params.get('sendBtcRequest') ?? '';
    if (token) {
      const request = decodeToken(token) as any as SendBtcTransactionOptions;
      return {
        payload: request.payload,
        requestToken: token,
      };
    }
    const recipients = JSON.parse(params.get('recipients')!);
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
  }, [params, btcAddress, network]);

  return { payload, tabId, requestToken, requestId };
};

export default useBtcSendRequestPayload;
