/* eslint-disable no-underscore-dangle */
import { defaultMainnet, type SettingsNetwork } from '@secretkeylabs/xverse-core';
import { markAlertsForShow } from '@utils/alertTracker';
import chromeStorage from '@utils/chromeStorage';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { createMigrate, persistReducer, persistStore, type PersistConfig } from 'redux-persist';
import { createStateSyncMiddleware, initMessageListener } from 'redux-state-sync';
import NftDataStateReducer from './nftData/reducer';
import type {
  AccountBtcAddressesV5,
  AccountV1,
  AccountV5,
  WalletStateV1,
  WalletStateV2,
  WalletStateV3,
  WalletStateV4,
  WalletStateV5,
  WalletStateV6,
  WalletStateV7,
  WalletStateV8,
} from './wallet/actions/migrationTypes';
import { type AvatarInfo, type WalletState } from './wallet/actions/types';
import walletReducer, { initialWalletState, rehydrateError } from './wallet/reducer';

const rootPersistConfig = {
  version: 1,
  key: 'root',
  storage: chromeStorage.local,
  blacklist: ['walletState'],
};

const migrations = {
  2: (state: WalletStateV1): WalletStateV2 => {
    if (state.network.type !== 'Mainnet') {
      return state as WalletStateV2;
    }
    return {
      ...state,
      network: {
        ...state.network,
        fallbackBtcApiUrl: initialWalletState.network.fallbackBtcApiUrl,
      },
    };
  },
  3: (
    state: WalletStateV2,
  ): WalletStateV3 & { coins: undefined; coinsList: undefined; brcCoinsList: undefined } => ({
    ...state,
    brc20ManageTokens:
      state.brcCoinsList?.reduce((acc, coin) => {
        if (coin.principal && coin.visible !== undefined) {
          acc[coin.principal] = coin.visible;
        }
        return acc;
      }, {}) ?? {},
    sip10ManageTokens:
      state.coinsList?.reduce((acc, coin) => {
        if (coin.principal && coin.visible !== undefined) {
          acc[coin.principal] = coin.visible;
        }
        return acc;
      }, {}) ?? {},
    runesManageTokens: {},
    coins: undefined,
    coinsList: undefined,
    brcCoinsList: undefined,
  }),
  4: (state: WalletStateV3): WalletStateV4 => ({
    ...state,
    selectedAccountIndex:
      state.selectedAccount?.deviceAccountIndex ?? state.selectedAccount?.id ?? 0,
    selectedAccountType: state.selectedAccount?.accountType ?? 'software',
  }),
  5: (state: WalletStateV4): WalletStateV5 => {
    const migrateAccount =
      (accountType: 'software' | 'ledger') =>
      (account: AccountV1 & { btcAddresses?: AccountBtcAddressesV5 }): AccountV5 => {
        const {
          btcAddress,
          btcPublicKey,
          ordinalsAddress,
          ordinalsPublicKey,
          btcAddresses,
          ...rest
        } = account;

        if (account.btcAddresses?.taproot.address) {
          return { ...account, accountType, btcAddresses: account.btcAddresses };
        }

        const paymentAddress = { address: btcAddress, publicKey: btcPublicKey };

        if (accountType === 'ledger') {
          return {
            ...rest,
            accountType,
            btcAddresses: {
              native: paymentAddress,
              taproot: { address: ordinalsAddress, publicKey: ordinalsPublicKey },
            },
          };
        }

        return {
          ...rest,
          accountType,
          btcAddresses: {
            nested: paymentAddress,
            taproot: { address: ordinalsAddress, publicKey: ordinalsPublicKey },
          },
        };
      };

    const migrateAvatarIds = (existingIds: Record<string, AvatarInfo>) => {
      const migratedIds: Record<string, AvatarInfo> = {};
      const { accountsList } = state;

      Object.keys(existingIds).forEach((btcAddress) => {
        if (!existingIds[btcAddress]) return;

        const legacyAccount = accountsList.find((account) => account.btcAddress === btcAddress);

        if (legacyAccount?.ordinalsAddress) {
          migratedIds[legacyAccount.ordinalsAddress] = existingIds[legacyAccount.btcAddress];
        } else {
          migratedIds[btcAddress] = existingIds[btcAddress];
        }
      });

      return migratedIds;
    };

    if ((state as unknown as WalletStateV5).btcPaymentAddressType === undefined) {
      markAlertsForShow(
        'native_segwit_intro',
        'co:panel:address_changed_to_native',
        'co:receive:address_change_button',
        'co:receive:address_changed_to_native',
      );
    }

    return {
      ...state,
      btcPaymentAddressType: (state as unknown as WalletStateV5).btcPaymentAddressType || 'nested',
      accountsList: state.accountsList.map(migrateAccount('software')),
      ledgerAccountsList: state.ledgerAccountsList.map(migrateAccount('ledger')),
      allowNestedSegWitAddress: true,

      // we cast state to v5 as the below went live without a migration
      hiddenCollectibleIds: (state as unknown as WalletStateV5).hiddenCollectibleIds || {},
      starredCollectibleIds: (state as unknown as WalletStateV5).starredCollectibleIds || {},
      avatarIds: migrateAvatarIds((state as unknown as WalletStateV5).avatarIds || {}),
      balanceHidden: false,
    };
  },
  6: (state: WalletStateV5): WalletStateV6 => {
    const { allowNestedSegWitAddress, ...migratedState } = state;
    return migratedState as WalletStateV6;
  },
  7: (
    // NOTE: because we forgot to bump the store version on L222, need to be defensive here
    // and only initialise if not defined
    state: WalletStateV6 & { showBalanceInBtc: boolean; hasBackedUpWallet: boolean },
  ): WalletStateV7 => ({
    ...state,
    showBalanceInBtc: state.showBalanceInBtc ?? false,
    hasBackedUpWallet: state.hasBackedUpWallet ?? true,
  }),
  8: (state: WalletStateV7): WalletStateV8 => {
    const migrateMainnetNetwork = (currentNetwork: SettingsNetwork) => ({
      ...currentNetwork,
      btcApiUrl:
        currentNetwork.btcApiUrl === 'https://mempool.space/api'
          ? defaultMainnet.btcApiUrl
          : currentNetwork.btcApiUrl,
      fallbackBtcApiUrl:
        !currentNetwork.fallbackBtcApiUrl ||
        currentNetwork.fallbackBtcApiUrl === 'https://btc-1.xverse.app'
          ? defaultMainnet.fallbackBtcApiUrl
          : currentNetwork.fallbackBtcApiUrl,
    });
    return {
      ...state,
      savedNetworks:
        state.savedNetworks?.map((network: SettingsNetwork) =>
          network.type === 'Mainnet' ? migrateMainnetNetwork(network) : network,
        ) ?? initialWalletState.savedNetworks,
      network:
        (state.network?.type === 'Mainnet'
          ? migrateMainnetNetwork(state.network)
          : state.network) ?? initialWalletState.network,
    };
  },
  9: (state: WalletStateV8): WalletState => {
    const { showBtcReceiveAlert, showOrdinalReceiveAlert, ...migratedState } = state;

    return {
      ...migratedState,
      keystoneAccountsList: [],
    };
  },

  /* *
   * When adding a new migration, add the new wallet state type to the migrationTypes file
   * and add the migration here.
   * The last migration should be a function that takes the previous state and returns the current WalletState type.
   *
   * e.g. if the current head is this:
   * 6: (state: WalletStateV5): WalletStateV6 => {
   *   const newState = { ...state };
   *   // migrate state here
   *   return newState as WalletState;
   * }
   *
   * Then update it to this:
   * 6: (state: WalletStateV5): WalletStateV6 => {
   *   const newState = { ...state };
   *   // migrate state here
   *   return newState;
   * }
   *
   * And add this:
   * 7: (state: WalletStateV6): WalletStateV7 => {
   *   const newState = { ...state };
   *   // migrate state here
   *   return newState as WalletState;  // << ensure this cast is done on the last migration
   * }
   * */
};

const WalletPersistConfig: PersistConfig<WalletState> = {
  version: 9,
  key: 'walletState',
  storage: chromeStorage.local,
  migrate: createMigrate(migrations as any, { debug: false }),
  // A timeout of 0 means timeout is disabled
  // If the timeout is enabled, the rehydration will fail on slower machines and the store will be reset
  timeout: 0,
};

const appReducer = combineReducers({
  walletState: persistReducer(WalletPersistConfig, walletReducer),
  nftDataState: NftDataStateReducer,
});

const rootReducer = (state: any, action: any) => appReducer(state, action);

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export type StoreState = ReturnType<typeof rootReducer>;

const storeMiddleware = [
  createStateSyncMiddleware({
    // We don't want to sync the redux-persist actions
    blacklist: ['persist/PERSIST', 'persist/REHYDRATE'],
  }),
];
const store = createStore(persistedReducer, applyMiddleware(...storeMiddleware));
const persistor = persistStore(store);

initMessageListener(store);

const rootStore = { store, persistor, rehydrateError };

export default rootStore;
