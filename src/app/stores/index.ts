import { chromeLocalStorage } from '@utils/chromeStorage';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { PersistConfig, createMigrate, persistReducer, persistStore } from 'redux-persist';
import { createStateSyncMiddleware, initMessageListener } from 'redux-state-sync';
import { WalletState } from './wallet/actions/types';
import walletReducer, { initialWalletState } from './wallet/reducer';

const rootPersistConfig = {
  version: 1,
  key: 'root',
  storage: chromeLocalStorage,
  blacklist: ['walletState'],
};

const migrations = {
  2: (state: WalletState) => {
    if (state.network.type === 'Testnet') {
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
};

export const WalletPersistConfig: PersistConfig<WalletState> = {
  version: 2,
  key: 'walletState',
  storage: chromeLocalStorage,
  migrate: createMigrate(migrations as any, { debug: false }),
};

const appReducer = combineReducers({
  walletState: persistReducer(WalletPersistConfig, walletReducer),
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
const persistedStore = persistStore(store);
initMessageListener(store);

const rootStore = { store, persistedStore };

export default rootStore;
