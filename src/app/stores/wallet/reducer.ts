import { defaultMainnet, initialNetworksList } from '@secretkeylabs/xverse-core';
import { REHYDRATE } from 'redux-persist';
import {
  AddToHideCollectiblesKey,
  AddToStarCollectiblesKey,
  ChangeBtcPaymentAddressTypeKey,
  ChangeFiatCurrencyKey,
  ChangeHasActivatedOrdinalsKey,
  ChangeHasActivatedRareSatsKey,
  ChangeHasActivatedRBFKey,
  ChangeNetworkKey,
  ChangeShowDataCollectionAlertKey,
  RareSatsNoticeDismissedKey,
  RemoveAccountAvatarKey,
  RemoveAllFromHideCollectiblesKey,
  RemoveFromHideCollectiblesKey,
  RemoveFromStarCollectiblesKey,
  ResetWalletKey,
  SelectAccountKey,
  SetAccountAvatarKey,
  SetAccountBalanceKey,
  SetAddingAccountKey,
  SetBalanceHiddenToggleKey,
  SetBrc20ManageTokensKey,
  SetFeeMultiplierKey,
  SetHiddenCollectiblesKey,
  SetNotificationBannersKey,
  SetRunesManageTokensKey,
  SetShowBalanceInBtcToggleKey,
  SetShowSpamTokensKey,
  SetSip10ManageTokensKey,
  SetSpamTokenKey,
  SetSpamTokensKey,
  SetWalletBackupStatusKey,
  SetWalletHideStxKey,
  SetWalletLockPeriodKey,
  SetWalletUnlockedKey,
  StoreEncryptedSeedKey,
  UpdateKeystoneAccountsKey,
  UpdateLedgerAccountsKey,
  UpdateSoftwareWalletsKey,
  type WalletActions,
  WalletSessionPeriods,
  type WalletState,
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
  network: { ...defaultMainnet },
  savedNetworks: initialNetworksList,
  softwareWallets: {
    Mainnet: [],
    Testnet: [],
    Testnet4: [],
    Signet: [],
    Regtest: [],
  },
  ledgerAccountsList: [],
  keystoneAccountsList: [],
  selectedAccountIndex: 0,
  selectedAccountType: 'software',
  btcPaymentAddressType: 'native',
  encryptedSeed: '',
  fiatCurrency: 'USD',
  sip10ManageTokens: {},
  brc20ManageTokens: {},
  runesManageTokens: {},
  notificationBanners: {},
  feeMultipliers: null,
  hasActivatedOrdinalsKey: true,
  hasActivatedRareSatsKey: true,
  hasActivatedRBFKey: true,
  rareSatsNoticeDismissed: undefined,
  showDataCollectionAlert: true,
  walletLockPeriod: WalletSessionPeriods.STANDARD,
  isUnlocked: false,
  hideStx: false,
  accountBalances: {},
  spamToken: null,
  spamTokens: [],
  showSpamTokens: false,
  hiddenCollectibleIds: {},
  starredCollectibleIds: {},
  avatarIds: {},
  balanceHidden: false,
  showBalanceInBtc: false,
  hasBackedUpWallet: true,
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
    case ResetWalletKey:
      return {
        ...initialWalletState,
      };
    case UpdateSoftwareWalletsKey: {
      const { network, softwareWallets } = action;
      const newSoftwareWallets = { ...state.softwareWallets };
      newSoftwareWallets[network] = softwareWallets;
      return {
        ...state,
        softwareWallets: newSoftwareWallets,
      };
    }
    case UpdateLedgerAccountsKey:
      return {
        ...state,
        ledgerAccountsList: action.ledgerAccountsList,
      };
    case UpdateKeystoneAccountsKey:
      return {
        ...state,
        keystoneAccountsList: action.keystoneAccountsList,
      };
    case SelectAccountKey:
      return {
        ...state,
        selectedAccountIndex: action.selectedAccountIndex,
        selectedAccountType: action.selectedAccountType,
        selectedWalletId: action.selectedWalletId,
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
    case ChangeBtcPaymentAddressTypeKey:
      return {
        ...state,
        btcPaymentAddressType: action.btcPaymentType,
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
    case SetAccountBalanceKey:
      return {
        ...state,
        accountBalances: {
          ...state.accountBalances,
          [action.accountKey]: action.totalBalance,
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
    case AddToStarCollectiblesKey:
      return {
        ...state,
        starredCollectibleIds: {
          ...state.starredCollectibleIds,
          [action.address]: [
            ...(state.starredCollectibleIds[action.address] ?? []),
            { id: action.id, collectionId: action.collectionId ?? '' },
          ],
        },
      };
    case RemoveFromStarCollectiblesKey: {
      const starredCollectibleIds = state.starredCollectibleIds[action.address] ?? [];
      const updatedStarCollectibleIds = starredCollectibleIds.filter(
        (collectible) => collectible.id !== action.id,
      );
      return {
        ...state,
        starredCollectibleIds: {
          ...state.starredCollectibleIds,
          [action.address]: updatedStarCollectibleIds,
        },
      };
    }
    case AddToHideCollectiblesKey: {
      const starredCollectibleIds = state.starredCollectibleIds[action.address] ?? [];
      const updatedStarCollectibleIds = starredCollectibleIds.filter(
        (collectible) => collectible.id !== action.id && collectible.collectionId !== action.id,
      );
      return {
        ...state,
        hiddenCollectibleIds: {
          ...state.hiddenCollectibleIds,
          [action.address]: {
            ...state.hiddenCollectibleIds[action.address],
            [action.id]: action.id ?? '',
          },
        },
        starredCollectibleIds: {
          ...state.starredCollectibleIds,
          [action.address]: updatedStarCollectibleIds,
        },
      };
    }
    case RemoveFromHideCollectiblesKey: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { [action.id]: _, ...hiddenCollectibleIds } =
        state.hiddenCollectibleIds[action.address];
      return {
        ...state,
        hiddenCollectibleIds: {
          ...state.hiddenCollectibleIds,
          [action.address]: hiddenCollectibleIds,
        },
      };
    }
    case RemoveAllFromHideCollectiblesKey:
      return {
        ...state,
        hiddenCollectibleIds: {
          ...state.hiddenCollectibleIds,
          [action.address]: {},
        },
      };
    case SetHiddenCollectiblesKey:
      return {
        ...state,
        hiddenCollectibleIds: {
          ...state.hiddenCollectibleIds,
          ...action.collectibleIds,
        },
      };
    case SetAccountAvatarKey:
      return {
        ...state,
        avatarIds: {
          ...state.avatarIds,
          [action.address]: action.avatar,
        },
      };
    case RemoveAccountAvatarKey: {
      const clonedAvatarIds = { ...state.avatarIds };
      delete clonedAvatarIds[action.address];
      return {
        ...state,
        avatarIds: clonedAvatarIds,
      };
    }
    case SetBalanceHiddenToggleKey: {
      return {
        ...state,
        balanceHidden: action.toggle,
      };
    }
    case SetShowBalanceInBtcToggleKey:
      return {
        ...state,
        showBalanceInBtc: action.toggle,
      };
    case SetWalletBackupStatusKey:
      return {
        ...state,
        hasBackedUpWallet: action.hasBackedUpWallet,
      };
    case SetAddingAccountKey:
      return {
        ...state,
        addingAccount: action.addingAccount,
      };
    default:
      return state;
  }
};
export default walletReducer;
