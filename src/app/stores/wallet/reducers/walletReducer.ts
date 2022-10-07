import { Network } from 'app/core/types/networks';
import { Account } from 'app/core/types/accounts';
import {
  WalletActions,
  SetWalletKey,
  ResetWalletKey,
  FetchAccountKey,
  AddAccountRequestKey,
  AddAccountSuccessKey,
  AddAccountFailureKey,
  SelectAccountKey,
} from '../actions/types';

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
  loadingWalletData: boolean;
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
  loadingWalletData: false,
};

const walletReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: WalletState = initialWalletState,
  action: WalletActions
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
    case FetchAccountKey:
      return {
        ...state,
        selectedAccount: action.selectedAccount,
        accountsList: action.accountsList,
      };
    case AddAccountRequestKey:
      return {
        ...state,
        loadingWalletData: true,
      };
    case AddAccountSuccessKey:
      return {
        ...state,
        loadingWalletData: false,
        accountsList: action.accountsList,
      };
    case AddAccountFailureKey:
      return {
        ...state,
        loadingWalletData: false,
      };
      case SelectAccountKey:
      return {
        ...state,
        selectedAccount: action.selectedAccount,
        stxAddress: action.stxAddress,
        btcAddress: action.btcAddress,
        masterPubKey: action.masterPubKey,
        stxPublicKey: action.stxPublicKey,
        btcPublicKey: action.btcPublicKey,
        network: action.network,
      };
    default:
      return state;
  }
};
export default walletReducer;
