import {
  StoreEncryptedSeedKey,
  WalletActions, SetWalletKey, ResetWalletKey, WalletState, UnlockWalletKey, LockWalletKey,
} from '../actions/types';

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
  encryptedSeed: '',
};

const walletReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: WalletState = initialWalletState,
  action: WalletActions,
): WalletState => {
  switch (action.type) {
    case SetWalletKey:
      return {
        ...state,
        ...action.wallet,
      };
    case ResetWalletKey:
      return {
        ...initialWalletState,
      };
    case StoreEncryptedSeedKey:
      return {
        ...state,
        encryptedSeed: action.encryptedSeed,
      };
    case UnlockWalletKey:
      return {
        ...state,
        seedPhrase: action.seed,
      };
    case LockWalletKey:
      return {
        ...state,
        seedPhrase: '',
      };
    default:
      return state;
  }
};
export default walletReducer;
