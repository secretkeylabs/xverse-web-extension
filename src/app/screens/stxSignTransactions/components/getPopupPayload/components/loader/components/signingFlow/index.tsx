import type { AccountWithDetails } from '@common/utils/getSelectedAccount';
import { SignLedger } from '@screens/stxSignTransactions/components/getPopupPayload/components/loader/components/signingFlow/components/signLedger';
import { useSignTransactionsSoftware } from '@screens/stxSignTransactions/hooks';
import {
  broadcastSignedTransaction,
  safePromise,
  type StacksNetwork,
  type WalletId,
} from '@secretkeylabs/xverse-core';
import type { StacksTransactionWire } from '@stacks/transactions';
import { isLedgerAccount } from '@utils/helper';
import { useCallback, useState } from 'react';
import { BroadcastError } from './components/broadcastError';
import { Review } from './components/review';
import { SignSuccess } from './components/signSuccess';
import { SigningError } from './components/signingError';

type StepsProps = {
  transactions: StacksTransactionWire[];
  account: AccountWithDetails;
  walletId: WalletId | undefined;
  network: StacksNetwork;
  isBroadcastRequested: boolean;
  onSignSuccess: (transactions: StacksTransactionWire[]) => void;
  onReviewCancel: () => void;
};

type State =
  | { name: 'review' }
  | { name: 'sign-ledger'; deviceAccountIndex: number }
  | { name: 'sign-software' }
  | { name: 'error' }
  | { name: 'broadcast-error' }
  | { name: 'sign-success' };

export function SigningFlow(props: StepsProps) {
  const {
    account,
    walletId,
    transactions,
    network,
    isBroadcastRequested,
    onSignSuccess,
    onReviewCancel,
  } = props;
  const [state, setState] = useState<State>({ name: 'review' });
  const { signTransactionsSoftware } = useSignTransactionsSoftware({
    account,
    walletId,
    network,
    transactions,
  });

  const handleReviewAccept = useCallback(async () => {
    if (isLedgerAccount(account))
      return setState({
        name: 'sign-ledger',
        deviceAccountIndex: account.deviceAccountIndex as number,
      });

    signTransactionsSoftware({
      onError: () => setState({ name: 'error' }),
      onSuccess: async (signedTransactions) => {
        if (isBroadcastRequested) {
          const [broadcastError] = await safePromise(
            Promise.all(
              signedTransactions.map((transaction) =>
                broadcastSignedTransaction(transaction, network),
              ),
            ),
          );
          if (broadcastError) return setState({ name: 'broadcast-error' });
        }
        onSignSuccess(signedTransactions);
        setState({ name: 'sign-success' });
      },
    });
  }, [account, isBroadcastRequested, network, onSignSuccess, signTransactionsSoftware]);

  switch (state.name) {
    case 'review':
      return <Review {...props} onCancel={onReviewCancel} onSuccess={handleReviewAccept} />;
    case 'sign-ledger':
      return (
        <SignLedger
          deviceAccountIndex={state.deviceAccountIndex}
          transactions={transactions}
          onError={() => {
            setState({ name: 'error' });
          }}
          onSuccess={async (signedTransactions: StacksTransactionWire[]) => {
            if (isBroadcastRequested) {
              const [error] = await safePromise(
                Promise.all(
                  signedTransactions.map((transaction) =>
                    broadcastSignedTransaction(transaction, network),
                  ),
                ),
              );
              if (error) {
                setState({ name: 'broadcast-error' });
                return;
              }
            }

            onSignSuccess(transactions);

            setState({ name: 'sign-success' });
          }}
          onCancel={() => {
            setState({ name: 'review' });
          }}
        />
      );
    case 'error':
      return <SigningError />;
    case 'broadcast-error':
      return <BroadcastError />;
    case 'sign-success':
      return (
        <SignSuccess transactions={transactions} isBroadcastRequested={isBroadcastRequested} />
      );
    default:
      return null;
  }
}
