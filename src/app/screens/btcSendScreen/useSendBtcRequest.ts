import useSelectedAccount from '@hooks/useSelectedAccount';
import {
  BitcoinNetworkType,
  SendBtcTransactionOptions,
  SendBtcTransactionPayload,
} from '@sats-connect/core';
import { Recipient, SettingsNetwork, signBtcTransaction } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { decodeToken } from 'jsontokens';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useBtcClient from '../../hooks/apiClients/useBtcClient';
import useSeedVault from '../../hooks/useSeedVault';
import useWalletSelector from '../../hooks/useWalletSelector';

const useSendBtcRequestParams = (btcAddress: string, network: SettingsNetwork) => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
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
    const transferRecipients = recipients?.map((value) => ({
      address: value.address,
      amountSats: BigInt(value.amount),
    }));
    const rpcPayload: SendBtcTransactionPayload = {
      senderAddress: btcAddress,
      recipients: transferRecipients,
      network: { type: BitcoinNetworkType[network.type] },
    };
    return {
      payload: rpcPayload,
      requestToken: null,
    };
  }, []);

  return { payload, tabId, requestToken, requestId };
};

function useSendBtcRequest() {
  const btcClient = useBtcClient();
  const { getSeed } = useSeedVault();
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const { payload, tabId, requestToken, requestId } = useSendBtcRequestParams(
    selectedAccount.btcAddress,
    network,
  );
  const [recipient, setRecipient] = useState<Recipient[]>([]);

  const generateSignedTransaction = async () => {
    const seedPhrase = await getSeed();
    const recipients: Recipient[] = [];
    payload.recipients?.forEach(async (value) => {
      const txRecipient: Recipient = {
        address: value.address,
        amountSats: new BigNumber(value.amountSats.toString()),
      };
      recipients.push(txRecipient);
    });
    setRecipient(recipients);
    const signedTx = await signBtcTransaction(
      recipients,
      payload.senderAddress || selectedAccount.btcAddress,
      selectedAccount?.id ?? 0,
      seedPhrase,
      btcClient,
      network.type,
    );
    return signedTx;
  };

  const {
    data: signedTx,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['generate-signed-transaction'],
    queryFn: generateSignedTransaction,
  });

  return {
    payload,
    tabId,
    requestToken,
    requestId,
    signedTx,
    isLoading,
    error,
    recipient,
  };
}

export default useSendBtcRequest;
