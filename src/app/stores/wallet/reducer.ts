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
  SetBtcWalletDataKey,
  SetCoinDataKey,
  AddAccountKey,
  UpdateVisibleCoinListKey,
  SetFeeMultiplierKey,
  ChangeFiatCurrencyKey,
  ChangeNetworkKey,
  GetActiveAccountsKey,
  SetWalletSeedPhraseKey,
  SetStxWalletDataKey,
  SetCoinRatesKey,
  ChangeHasActivatedOrdinalsKey,
  ChangeShowBtcReceiveAlertKey,
  ChangeShowOrdinalReceiveAlertKey,
  AddLedgerAccountKey,
} from './actions/types';

const initialWalletState: WalletState = {
  stxAddress: '',
  btcAddress: '',
  ordinalsAddress: '',
  masterPubKey: '',
  stxPublicKey: '',
  btcPublicKey: '',
  ordinalsPublicKey: '',
  network: {
    type: 'Mainnet',
    address: 'https://stacks-node-api.mainnet.stacks.co',
  },
  accountsList: [],
  ledgerAccountsList: [],
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
  feeMultipliers: null,
  networkAddress: undefined,
  hasActivatedOrdinalsKey: undefined,
  showBtcReceiveAlert: false,
  showOrdinalReceiveAlert: false,
  isLedgerAccount: undefined,
  accountName: undefined,
};

const walletReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: WalletState = initialWalletState,
  action: WalletActions
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
    case AddLedgerAccountKey:
      return {
        ...state,
        ledgerAccountsList: action.ledgerAccountsList,
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
        isLedgerAccount: action.isLedgerAccount,
        accountName: action.accountName,
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
        selectedAccount: null,
        accountsList: [],
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
    default:
      return state;
  }
};
export default walletReducer;
