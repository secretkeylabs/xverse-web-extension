import { Network } from 'app/core/types/networks';
import { Account } from 'app/core/types/accounts';
import { WalletActions, SetWalletKey, ResetWalletKey } from '../actions/types';

interface WalletState {
  stxAddress: string;
  btcAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  accountsList: Account[];
  selectedAccount: Account | null;
  network: Network;
  seedPhrase: string;
  isLocked: boolean;
}

const initialWalletState: WalletState = {
  stxAddress: '',
  btcAddress: '',
  masterPubKey: '',
  stxPublicKey: '',
  btcPublicKey: '',
  network: 'Mainnet',
  accountsList: [],
  selectedAccount: null,
  seedPhrase: '',
  isLocked: true,
};

const walletReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: WalletState = initialWalletState,
  action: WalletActions,
) => {
  switch (action.type) {
    case SetWalletKey:
      return {
        ...state,
        ...action.wallet,
        isLocked: false,
      };
    case ResetWalletKey:
      return {
        ...state,
        ...initialWalletState,
      };
    default:
      return state;
  }
};
export default walletReducer;
