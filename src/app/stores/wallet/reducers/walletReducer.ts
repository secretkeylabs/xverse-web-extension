import {
  StoreEncryptedSeedKey,
  WalletActions, SetWalletKey, ResetWalletKey, WalletState, UnlockWalletKey, LockWalletKey,  FetchAccountKey,
  AddAccountRequestKey,
  AddAccountSuccessKey,
  AddAccountFailureKey,
  SelectAccountKey,
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
  loadingWalletData: false,
  fiatCurrency: 'USD',
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
      }
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
