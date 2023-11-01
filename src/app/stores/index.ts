import { chromeLocalStorage } from '@utils/chromeStorage';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { PersistConfig, persistReducer, persistStore } from 'redux-persist';
import { createStateSyncMiddleware, initMessageListener } from 'redux-state-sync';
import NftDataStateReducer from './nftData/reducer';
import { WalletState } from './wallet/actions/types';
import walletReducer from './wallet/reducer';

const rootPersistConfig = {
  version: 1,
  key: 'root',
  storage: chromeLocalStorage,
  blacklist: ['walletState'],
};

export const WalletPersistConfig: PersistConfig<WalletState> = {
  version: 1,
  key: 'walletState',
  storage: chromeLocalStorage,
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
const persistedStore = persistStore(store);
initMessageListener(store);

const rootStore = { store, persistedStore };

export default rootStore;
