import { defaultMainnet, initialNetworksList } from '@secretkeylabs/xverse-core';
import { REHYDRATE } from 'redux-persist';
import {
  AddAccountKey,
  ChangeFiatCurrencyKey,
  ChangeHasActivatedOrdinalsKey,
  ChangeHasActivatedRBFKey,
  ChangeHasActivatedRareSatsKey,
  ChangeNetworkKey,
  ChangeShowBtcReceiveAlertKey,
  ChangeShowDataCollectionAlertKey,
  ChangeShowOrdinalReceiveAlertKey,
  FetchAccountKey,
  GetActiveAccountsKey,
  RareSatsNoticeDismissedKey,
  RenameAccountKey,
  ResetWalletKey,
  SelectAccountKey,
  SetAccountBalanceKey,
  SetBrc20ManageTokensKey,
  SetFeeMultiplierKey,
  SetNotificationBannersKey,
  SetRunesManageTokensKey,
  SetShowSpamTokensKey,
  SetSip10ManageTokensKey,
  SetSpamTokenKey,
  SetSpamTokensKey,
  SetWalletHideStxKey,
  SetWalletKey,
  SetWalletLockPeriodKey,
  SetWalletUnlockedKey,
  StoreEncryptedSeedKey,
  UpdateLedgerAccountsKey,
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
 *  - feeMultipliers: null,
 *
 * TODO refactor most of these values out of the store and use query cache instead
 */
export const initialWalletState: WalletState = {
  stxAddress: '',
  btcAddress: '',
  ordinalsAddress: '',
  masterPubKey: '',
  stxPublicKey: '',
  btcPublicKey: '',
  ordinalsPublicKey: '',
  network: { ...defaultMainnet },
  savedNetworks: initialNetworksList,
  accountsList: [],
  ledgerAccountsList: [],
  selectedAccount: null,
  encryptedSeed: '',
  fiatCurrency: 'USD',
  sip10ManageTokens: {},
  brc20ManageTokens: {},
  runesManageTokens: {},
  notificationBanners: {},
  feeMultipliers: null,
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
  hideStx: false,
  accountBalances: {},
  spamToken: null,
  spamTokens: [],
  showSpamTokens: false,
};

/**
 * This is a ref to store the error that occurred during rehydration
 * It's a hack to prevent data corruption when rehydration fails but still
 * show the error to the user
 */
export const rehydrateError: { current?: string } = {
  current: undefined,
};

const walletReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: WalletState = initialWalletState,
  action: WalletActions | { type: typeof REHYDRATE; err?: unknown },
): WalletState => {
  switch (action.type) {
    case REHYDRATE:
      if (action.err) {
        // We can't update the state since we're throwing an error, so we store the error in a ref
        rehydrateError.current = `${action.err}`;
        // There was an error loading state from chrome storage so we bail to prevent data corruption
        // If not done, redux-persist will hydrate the state with the initial state and then store that
        // in storage resulting in data loss
        throw new Error('Failed to load state from storage.');
      }
      return state;
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
    case SetFeeMultiplierKey:
      return {
        ...state,
        feeMultipliers: action.feeMultipliers,
      };
    case ChangeFiatCurrencyKey:
      return {
        ...state,
        fiatCurrency: action.fiatCurrency,
        accountBalances: {},
      };
    case ChangeNetworkKey:
      return {
        ...state,
        network: action.network,
        savedNetworks: [
          ...state.savedNetworks.filter((n) => n.type !== action.network.type),
          action.network,
        ],
        accountBalances: {},
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
    case SetSip10ManageTokensKey:
      return {
        ...state,
        sip10ManageTokens: {
          ...state.sip10ManageTokens,
          [action.principal]: action.isEnabled,
        },
      };
    case SetBrc20ManageTokensKey:
      return {
        ...state,
        brc20ManageTokens: {
          ...state.brc20ManageTokens,
          [action.principal]: action.isEnabled,
        },
      };
    case SetRunesManageTokensKey:
      return {
        ...state,
        runesManageTokens: {
          ...state.runesManageTokens,
          [action.principal]: action.isEnabled,
        },
      };
    case SetNotificationBannersKey:
      return {
        ...state,
        notificationBanners: {
          ...state.notificationBanners,
          [action.id]: action.isDismissed,
        },
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
    case RenameAccountKey:
      return {
        ...state,
        accountsList: action.accountsList,
        selectedAccount: action.selectedAccount,
      };
    case SetAccountBalanceKey:
      return {
        ...state,
        accountBalances: {
          ...state.accountBalances,
          [action.btcAddress]: action.totalBalance,
        },
      };
    case SetWalletHideStxKey:
      return {
        ...state,
        hideStx: action.hideStx,
      };
    case SetSpamTokenKey:
      return {
        ...state,
        spamToken: action.spamToken,
      };
    case SetSpamTokensKey:
      return {
        ...state,
        spamTokens: action.spamTokens,
      };
    case SetShowSpamTokensKey:
      return {
        ...state,
        showSpamTokens: action.showSpamTokens,
      };
    default:
      return state;
  }
};
export default walletReducer;
