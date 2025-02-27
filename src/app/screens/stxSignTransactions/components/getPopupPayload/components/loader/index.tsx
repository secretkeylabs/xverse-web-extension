import { type Context } from '@common/utils/popup';
import { sendUserRejectionMessage } from '@common/utils/rpc/responseMessages/errors';
import useNetworkSelector from '@hooks/useNetwork';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { type StxSignTransactionsRequestMessage } from '@sats-connect/core';
import {
  useGetMakeSendRpcSuccessResponse,
  useGetTransactionsFromRpcMessage,
} from '@screens/stxSignTransactions/hooks';
import { useCallback } from 'react';
import { SigningFlow } from './components/signingFlow';

type Loader2Props = {
  data: StxSignTransactionsRequestMessage;
  context: Context;
};

export function Loader({ data, context }: Loader2Props) {
  const getTransactionsFromRpcMessage = useGetTransactionsFromRpcMessage();
  const makeSendRpcSuccessResponse = useGetMakeSendRpcSuccessResponse();
  const account = useSelectedAccount();
  const network = useNetworkSelector();
  const { selectedWalletId } = useWalletSelector();

  const handleReviewCancel = useCallback(() => {
    sendUserRejectionMessage({
      messageId: data.id,
      tabId: context.tabId,
    });
    window.close();
  }, [data.id, context.tabId]);

  const sendRpcSuccessResponse = makeSendRpcSuccessResponse({
    tabId: context.tabId,
    messageId: data.id,
  });

  const transactions = getTransactionsFromRpcMessage(data);
  const isBroadcastRequested = data.params.broadcast ?? true;

  return (
    <SigningFlow
      account={account}
      walletId={selectedWalletId}
      network={network}
      transactions={transactions}
      isBroadcastRequested={isBroadcastRequested}
      onSignSuccess={sendRpcSuccessResponse}
      onReviewCancel={handleReviewCancel}
    />
  );
}
