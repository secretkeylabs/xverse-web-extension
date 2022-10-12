import ChromeStorage from '@utils/storage';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import walletReducer from './wallet/reducers/walletReducer';

export const storage = new ChromeStorage(chrome.storage.local, chrome.runtime);

const rootPersistConfig = {
  key: 'root',
  storage,
  blacklist: ['walletState'],
};

const walletPersistConfig = {
  key: 'wallet',
  storage,
};

const appReducer = combineReducers({
  walletState: persistReducer(walletPersistConfig, walletReducer),
});

const rootReducer = (state: any, action: any) => appReducer(state, action);

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export type StoreState = ReturnType<typeof rootReducer>;

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(persistedReducer, applyMiddleware(sagaMiddleware));
  const persistedStore = persistStore(store);
  return { store, persistedStore };
};

export default configureStore;
