import { initialNetworksList } from '@utils/constants';
import BigNumber from 'bignumber.js';
import {
  AddAccountKey,
  ChangeFiatCurrencyKey,
  ChangeHasActivatedOrdinalsKey,
  ChangeNetworkKey,
  ChangeShowBtcReceiveAlertKey,
  ChangeShowOrdinalReceiveAlertKey,
  UpdateLedgerAccountsKey,
  FetchAccountKey,
  GetActiveAccountsKey,
  ResetWalletKey,
  SelectAccountKey,
  SetBrcCoinsListKey,
  SetBtcWalletDataKey,
  SetCoinDataKey,
  SetCoinRatesKey,
  SetFeeMultiplierKey,
  SetStxWalletDataKey,
  SetWalletKey,
  SetWalletLockPeriodKey,
  StoreEncryptedSeedKey,
  UpdateVisibleCoinListKey,
  WalletActions,
  WalletSessionPeriods,
  WalletState,
  SetWalletUnlockedKey,
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
  ledgerAccountsList: [],
  selectedAccount: null,
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
  showBtcReceiveAlert: true,
  showOrdinalReceiveAlert: true,
  accountType: 'software',
  accountName: undefined,
  walletLockPeriod: WalletSessionPeriods.STANDARD,
  isUnlocked: false,
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
        stxAddress: action.wallet.stxAddress,
        btcAddress: action.wallet.btcAddress,
        ordinalsAddress: action.wallet.ordinalsAddress,
        masterPubKey: action.wallet.masterPubKey,
        stxPublicKey: action.wallet.stxPublicKey,
        btcPublicKey: action.wallet.btcPublicKey,
        ordinalsPublicKey: action.wallet.ordinalsPublicKey,
        accountType: action.wallet.accountType,
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
    case UpdateLedgerAccountsKey:
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
        accountType: action.accountType,
        accountName: action.accountName,
      };
    case StoreEncryptedSeedKey:
      return {
        ...state,
        encryptedSeed: action.encryptedSeed,
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
    case SetWalletLockPeriodKey:
      return {
        ...state,
        walletLockPeriod: action.walletLockPeriod,
      };
    case SetWalletUnlockedKey:
      return {
        ...state,
        isUnlocked: action.isUnlocked,
      };
    default:
      return state;
  }
};
export default walletReducer;
