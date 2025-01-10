import type { StacksTransaction } from '@stacks/transactions';
import { useState } from 'react';
import { ConnectingLedger } from './components/connectLedger';
import { SigningTransactions } from './components/signingTransactions';
import type { Transport } from './types';

type Props = {
  transactions: StacksTransaction[];
  deviceAccountIndex: number;
  onSuccess: (signedTransactions: StacksTransaction[]) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
};

type State = { name: 'connecting-ledger' } | { name: 'signing-transactions'; transport: Transport };

export function SignLedger({
  transactions,
  deviceAccountIndex,
  onError,
  onSuccess,
  onCancel,
}: Props) {
  const [state, setState] = useState<State>({ name: 'connecting-ledger' });

  switch (state.name) {
    case 'connecting-ledger':
      return (
        <ConnectingLedger
          onConnect={(transport) => {
            setState({ name: 'signing-transactions', transport });
          }}
          onCancel={onCancel}
        />
      );
    case 'signing-transactions':
      return (
        <SigningTransactions
          transport={state.transport}
          transactions={transactions}
          accountIndex={deviceAccountIndex}
          onSuccess={onSuccess}
          onError={onError}
        />
      );
    default:
      return null;
  }
}
