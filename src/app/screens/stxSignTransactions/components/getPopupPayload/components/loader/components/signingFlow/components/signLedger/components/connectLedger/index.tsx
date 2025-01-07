import { useState } from 'react';
import type { Transport } from '../../types';
import { Connecting } from './components/connecting';
import { Error } from './components/error';
import { Initial } from './components/initial';
import { Success } from './components/success';

interface Props {
  onConnect: (transport: Transport) => void;
  onCancel: () => void;
}

type State =
  | { name: 'initial' }
  | { name: 'connecting' }
  | { name: 'success'; transport: Transport }
  | { name: 'error' };

export function ConnectingLedger({ onConnect, onCancel }: Props) {
  const [state, setState] = useState<State>({ name: 'initial' });

  switch (state.name) {
    case 'initial':
      return (
        <Initial
          onStart={() => {
            setState({ name: 'connecting' });
          }}
          onBack={onCancel}
        />
      );
    case 'connecting':
      return (
        <Connecting
          onCancel={onCancel}
          onConnect={(transport) => {
            setState({ name: 'success', transport });
          }}
          onError={() => setState({ name: 'error' })}
        />
      );
    case 'success':
      return <Success onFinish={() => onConnect(state.transport)} />;
    case 'error':
      return (
        <Error
          onTryAgain={() => {
            setState({ name: 'connecting' });
          }}
        />
      );
    default:
      return null;
  }
}
