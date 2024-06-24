import { Account, AccountType, Coin, FungibleToken } from '@secretkeylabs/xverse-core';
import chromeStorage from '@utils/chromeStorage';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { PersistConfig, createMigrate, persistReducer, persistStore } from 'redux-persist';
import { createStateSyncMiddleware, initMessageListener } from 'redux-state-sync';
import NftDataStateReducer from './nftData/reducer';
import { WalletState } from './wallet/actions/types';
import walletReducer, { initialWalletState, rehydrateError } from './wallet/reducer';

const rootPersistConfig = {
  version: 1,
  key: 'root',
  storage: chromeStorage.local,
  blacklist: ['walletState'],
};

const migrations = {
  2: (state: WalletState) => {
    if (state.network.type !== 'Mainnet') {
      return state;
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
    state: WalletState & {
      brcCoinsList: FungibleToken[] | null; // removed in v3
      coinsList: FungibleToken[] | null; // removed in v3
      coins: Coin[]; // removed in v3
    },
  ) => ({
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
    coins: undefined,
    coinsList: undefined,
    brcCoinsList: undefined,
  }),
  4: (
    state: WalletState & {
      stxAddress: string;
      btcAddress: string;
      ordinalsAddress: string;
      masterPubKey: string;
      stxPublicKey: string;
      btcPublicKey: string;
      ordinalsPublicKey: string;
      selectedAccount: Account | null;
      accountType: AccountType | undefined;
      accountName: string | undefined;
    },
  ) => ({
    ...state,
    selectedAccountIndex:
      state.selectedAccount?.deviceAccountIndex ?? state.selectedAccount?.id ?? 0,
    selectedAccountType: state.selectedAccount?.accountType ?? 'software',
  }),
};

const WalletPersistConfig: PersistConfig<WalletState> = {
  version: 4,
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
