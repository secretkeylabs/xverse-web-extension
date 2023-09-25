import { Recipient, signBtcTransaction } from '@secretkeylabs/xverse-core/transactions/btc';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { decodeToken } from 'jsontokens';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SendBtcTransactionOptions } from 'sats-connect';
import useWalletSelector from './useWalletSelector';

function useSendBtcRequest() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const [recipient, setRecipient] = useState<Recipient[]>([]);
  const requestToken = params.get('sendBtcRequest') ?? '';
  const request = decodeToken(requestToken) as any as SendBtcTransactionOptions;
  const tabId = params.get('tabId') ?? '0';

  const { network, selectedAccount, seedPhrase } = useWalletSelector();

  const generateSignedTransaction = async () => {
    const recipients: Recipient[] = [];
    request.payload?.recipients?.forEach(async (value) => {
      const txRecipient: Recipient = {
        address: value.address,
        amountSats: new BigNumber(value.amountSats.toString()),
      };
      recipients.push(txRecipient);
    });
    setRecipient(recipients);
    const signedTx = await signBtcTransaction(
      recipients,
      request.payload?.senderAddress,
      selectedAccount?.id ?? 0,
      seedPhrase,
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
    payload: request.payload,
    tabId,
    requestToken,
    signedTx,
    isLoading,
    error,
    recipient,
  };
}

export default useSendBtcRequest;
