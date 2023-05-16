import ChromeStorage from '@utils/storage';
import { createStore, combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import walletReducer from './wallet/reducer';
import NftDataStateReducer from './nftData/reducer';

export const storage = new ChromeStorage(chrome.storage.local, chrome.runtime);

const rootPersistConfig = {
  key: 'root',
  storage,
  blacklist: ['nftDataState', 'walletState'],
};

const WalletPersistConfig = {
  key: 'walletState',
  storage,
  blacklist: ['seedPhrase'],
};

const appReducer = combineReducers({
  walletState: persistReducer(WalletPersistConfig, walletReducer),
  nftDataState: NftDataStateReducer,
});

const rootReducer = (state: any, action: any) => appReducer(state, action);

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export type StoreState = ReturnType<typeof rootReducer>;

const rootStore = (() => {
  const store = createStore(persistedReducer);
  const persistedStore = persistStore(store);
  return { store, persistedStore };
})();

export default rootStore;
