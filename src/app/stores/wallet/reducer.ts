import { initialNetworksList } from '@utils/constants';
import {
  AddAccountKey,
  ChangeFiatCurrencyKey,
  ChangeHasActivatedOrdinalsKey,
  ChangeHasActivatedRareSatsKey,
  ChangeHasActivatedRBFKey,
  ChangeNetworkKey,
  ChangeShowBtcReceiveAlertKey,
  ChangeShowDataCollectionAlertKey,
  ChangeShowOrdinalReceiveAlertKey,
  FetchAccountKey,
  GetActiveAccountsKey,
  RareSatsNoticeDismissedKey,
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
  SetWalletUnlockedKey,
  StoreEncryptedSeedKey,
  UpdateLedgerAccountsKey,
  UpdateVisibleCoinListKey,
  WalletActions,
  WalletSessionPeriods,
  WalletState,
} from './actions/types';

/*
 * This store should ONLY be used for global app settings such as:
 *  - hasActivatedOrdinalsKey: undefined,
 *  - hasActivatedRareSatsKey: undefined,
 *  - hasActivatedRBFKey: true,
 *  - rareSatsNoticeDismissed: undefined,
 *  - showBtcReceiveAlert: true,
 *  - showOrdinalReceiveAlert: true,
 *  - showDataCollectionAlert: true,
 *  - btcApiUrl: '',
 *  - selectedAccount: null,
 *  - accountType: 'software',
 *  - accountName: undefined,
 *  - walletLockPeriod: WalletSessionPeriods.STANDARD,
 *  - isUnlocked: false,
 *  - fiatCurrency: 'USD',
 *
 * because we get many bugs around caching the wrong values when switching accounts,
 * we prefer react-query cache (with the correct cache keys) for all
 * account-specific values, and API fetch results such as:
 *  - btcFiatRate: '0',
 *  - stxBtcRate: '0',
 *  - stxBalance: '0',
 *  - stxAvailableBalance: '0',
 *  - stxLockedBalance: '0',
 *  - stxNonce: 0,
 *  - btcBalance: '0',
 *  - feeMultipliers: null,
 *
 * TODO refactor most of these values out of the store and use query cache instead
 */
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
  btcFiatRate: '0',
  stxBtcRate: '0',
  stxBalance: '0',
  stxAvailableBalance: '0',
  stxLockedBalance: '0',
  stxNonce: 0,
  btcBalance: '0',
  coinsList: null,
  coins: [],
  brcCoinsList: [],
  feeMultipliers: null,
  networkAddress: undefined,
  btcApiUrl: '',
  hasActivatedOrdinalsKey: undefined,
  hasActivatedRareSatsKey: undefined,
  hasActivatedRBFKey: true,
  rareSatsNoticeDismissed: undefined,
  showBtcReceiveAlert: true,
  showOrdinalReceiveAlert: true,
  showDataCollectionAlert: true,
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
    case ChangeHasActivatedRareSatsKey:
      return {
        ...state,
        hasActivatedRareSatsKey: action.hasActivatedRareSatsKey,
      };
    case ChangeHasActivatedRBFKey:
      return {
        ...state,
        hasActivatedRBFKey: action.hasActivatedRBFKey,
      };
    case RareSatsNoticeDismissedKey:
      return {
        ...state,
        rareSatsNoticeDismissed: action.rareSatsNoticeDismissed,
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
    case ChangeShowDataCollectionAlertKey:
      return {
        ...state,
        showDataCollectionAlert: action.showDataCollectionAlert,
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
