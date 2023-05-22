import { Recipient, signBtcTransaction } from '@secretkeylabs/xverse-core/transactions/btc';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';
import { SendBtcTransactionOptions } from 'sats-connect';
import useWalletSelector from './useWalletSelector';

function useSendBtcRequest() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('sendBtcRequest') ?? '';
  const request = decodeToken(requestToken) as any as SendBtcTransactionOptions;
  const requestString = decodeToken(requestToken as string);
  const tabId = params.get('tabId') ?? '0';

  const {
    btcAddress,
    network,
    selectedAccount,
    seedPhrase,
  } = useWalletSelector();

  const generateSignedTransaction = async () => {
    const recipients: Recipient[] = [
      {
        address: request.payload?.recipientAddress,
        amountSats: new BigNumber(request.payload?.satsAmount),
      },
    ];
    const signedTx = await signBtcTransaction(
      recipients,
      btcAddress,
      selectedAccount?.id ?? 0,
      seedPhrase,
      network.type,
    );
    return signedTx;
  };

  const {
    data: signedTx, isLoading, error,
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
    requestString,
  };
}

export default useSendBtcRequest;
