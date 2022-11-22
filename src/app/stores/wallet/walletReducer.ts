import BigNumber from 'bignumber.js';
import {
  StoreEncryptedSeedKey,
  WalletActions,
  SetWalletKey,
  ResetWalletKey,
  WalletState,
  UnlockWalletKey,
  LockWalletKey,
  FetchAccountKey,
  SelectAccountKey,
  FetchRatesSuccessKey,
  FetchStxWalletDataRequestKey,
  FetchStxWalletDataSuccessKey,
  FetchStxWalletDataFailureKey,
  FetchBtcWalletDataRequestKey,
  FetchBtcWalletDataSuccessKey,
  FetchBtcWalletDataFailureKey,
  FetchCoinDataRequestKey,
  FetchCoinDataSuccessKey,
  FetchCoinDataFailureKey,
  AddAccountKey,
  UpdateVisibleCoinListKey,
  FetchFeeMultiplierKey,
  ChangeFiatCurrencyKey,
  ChangeNetworkKey,
} from './actions/types';

const initialWalletState: WalletState = {
  stxAddress: '',
  btcAddress: '',
  masterPubKey: '',
  stxPublicKey: '',
  btcPublicKey: '',
  network: {
    type: 'Mainnet',
    address: 'https://stacks-node-api.mainnet.stacks.co',
  },
  accountsList: [],
  selectedAccount: null,
  seedPhrase: '',
  encryptedSeed: '',
  loadingWalletData: false,
  loadingBtcData: false,
  fiatCurrency: 'USD',
  btcFiatRate: new BigNumber(0),
  stxBtcRate: new BigNumber(0),
  stxBalance: new BigNumber(0),
  stxAvailableBalance: new BigNumber(0),
  stxLockedBalance: new BigNumber(0),
  stxTransactions: [],
  stxNonce: 0,
  btcBalance: new BigNumber(0),
  btcTransactions: [],
  coinsList: null,
  coins: [],
  feeMultipliers: null,
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
    case AddAccountKey:
      return {
        ...state,
        accountsList: action.accountsList,
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
    case FetchRatesSuccessKey:
      return {
        ...state,
        btcFiatRate: action.btcFiatRate,
        stxBtcRate: action.stxBtcRate,
      };
    case FetchStxWalletDataRequestKey:
      return {
        ...state,
        loadingWalletData: true,
      };
    case FetchStxWalletDataSuccessKey:
      return {
        ...state,
        stxBalance: action.stxBalance,
        stxAvailableBalance: action.stxAvailableBalance,
        stxLockedBalance: action.stxLockedBalance,
        stxTransactions: action.stxTransactions,
        stxNonce: action.stxNonce,
        loadingWalletData: false,
      };
    case FetchStxWalletDataFailureKey:
      return {
        ...state,
        loadingWalletData: false,
      };
    case FetchBtcWalletDataRequestKey:
      return {
        ...state,
        loadingBtcData: true,
      };
    case FetchBtcWalletDataSuccessKey:
      return {
        ...state,
        btcBalance: action.balance,
        btcTransactions: action.btctransactions,
        loadingBtcData: false,
      };
    case FetchBtcWalletDataFailureKey:
      return {
        ...state,
        loadingBtcData: false,
      };
    case FetchCoinDataRequestKey:
      return {
        ...state,
        loadingWalletData: true,
      };
    case FetchCoinDataSuccessKey:
      return {
        ...state,
        coinsList: action.coinsList,
        coins: action.supportedCoins,
        loadingWalletData: false,
      };
    case FetchCoinDataFailureKey:
      return {
        ...state,
        loadingWalletData: false,
      };
    case UpdateVisibleCoinListKey:
      return {
        ...state,
        coinsList: action.coinsList,
      };
    case FetchFeeMultiplierKey:
      return {
        ...state,
        feeMultipliers: action.feeMultipliers,
      };
    case ChangeFiatCurrencyKey:
      return {
        ...state,
        fiatCurrency: action.fiatCurrency,
      };
    case ChangeNetworkKey:
      return {
        ...state,
        network: action.network,
        selectedAccount: null,
        accountsList: [],
      };
    default:
      return state;
  }
};
export default walletReducer;
