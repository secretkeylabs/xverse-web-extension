import { initialNetworksList } from '@utils/constants';
import BigNumber from 'bignumber.js';
import {
  AddAccountKey,
  ChangeFiatCurrencyKey,
  ChangeHasActivatedOrdinalsKey,
  ChangeNetworkKey,
  ChangeShowBtcReceiveAlertKey,
  ChangeShowOrdinalReceiveAlertKey,
  FetchAccountKey,
  GetActiveAccountsKey,
  LockWalletKey,
  ResetWalletKey,
  SelectAccountKey,
  SetBrcCoinsListKey,
  SetBtcWalletDataKey,
  SetCoinDataKey,
  SetCoinRatesKey,
  SetFeeMultiplierKey,
  SetStxWalletDataKey,
  SetWalletKey,
  SetWalletSeedPhraseKey,
  StoreEncryptedSeedKey,
  UnlockWalletKey,
  UpdateVisibleCoinListKey,
  WalletActions,
  WalletState,
} from './actions/types';

const initialWalletState: WalletState = {
  stxAddress: '',
  btcAddress: '',
  ordinalsAddress: '',
  masterPubKey: '',
  stxPublicKey: '',
  btcPublicKey: '',
  ordinalsPublicKey: '',
  network: initialNetworksList[0],
  accountsList: [],
  selectedAccount: null,
  seedPhrase: '',
  encryptedSeed: '',
  fiatCurrency: 'USD',
  btcFiatRate: new BigNumber(0),
  stxBtcRate: new BigNumber(0),
  stxBalance: new BigNumber(0),
  stxAvailableBalance: new BigNumber(0),
  stxLockedBalance: new BigNumber(0),
  stxNonce: 0,
  btcBalance: new BigNumber(0),
  coinsList: null,
  coins: [],
  brcCoinsList: [],
  feeMultipliers: null,
  networkAddress: undefined,
  btcApiUrl: '',
  hasActivatedOrdinalsKey: undefined,
  showBtcReceiveAlert: false,
  showOrdinalReceiveAlert: false,
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
        ordinalsAddress: action.ordinalsAddress,
        btcAddress: action.btcAddress,
        masterPubKey: action.masterPubKey,
        stxPublicKey: action.stxPublicKey,
        btcPublicKey: action.btcPublicKey,
        ordinalsPublicKey: action.ordinalsPublicKey,
        network: action.network,
      };
    case StoreEncryptedSeedKey:
      return {
        ...state,
        encryptedSeed: action.encryptedSeed,
      };
    case SetWalletSeedPhraseKey:
      return {
        ...state,
        seedPhrase: action.seedPhrase,
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
    case SetCoinRatesKey:
      return {
        ...state,
        btcFiatRate: action.btcFiatRate,
        stxBtcRate: action.stxBtcRate,
      };
    case SetStxWalletDataKey:
      return {
        ...state,
        stxBalance: action.stxBalance,
        stxAvailableBalance: action.stxAvailableBalance,
        stxLockedBalance: action.stxLockedBalance,
        stxNonce: action.stxNonce,
      };
    case SetBtcWalletDataKey:
      return {
        ...state,
        btcBalance: action.balance,
      };
    case SetCoinDataKey:
      return {
        ...state,
        coinsList: action.coinsList,
        coins: action.supportedCoins,
      };
    case UpdateVisibleCoinListKey:
      return {
        ...state,
        coinsList: action.coinsList,
      };
    case SetFeeMultiplierKey:
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
        networkAddress: action.networkAddress,
        btcApiUrl: action.btcApiUrl,
      };
    case GetActiveAccountsKey:
      return {
        ...state,
        accountsList: action.accountsList,
      };
    case ChangeHasActivatedOrdinalsKey:
      return {
        ...state,
        hasActivatedOrdinalsKey: action.hasActivatedOrdinalsKey,
      };
    case ChangeShowBtcReceiveAlertKey:
      return {
        ...state,
        showBtcReceiveAlert: action.showBtcReceiveAlert,
      };
    case ChangeShowOrdinalReceiveAlertKey:
      return {
        ...state,
        showOrdinalReceiveAlert: action.showOrdinalReceiveAlert,
      };
    case SetBrcCoinsListKey:
      return {
        ...state,
        brcCoinsList: action.brcCoinsList,
      };
    default:
      return state;
  }
};
export default walletReducer;
