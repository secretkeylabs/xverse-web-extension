import ChromeStorage from '@utils/storage';
import { createStore, combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import walletReducer from './wallet/reducer';
import NftDataStateReducer from './nftData/reducer';
import dlcReducer from './dlc/reducer';
import { DlcBitcoinBlockchain } from 'app/dlcClasses/DlcBlockchain';
import { LocalRepository } from 'app/dlcClasses/persistence/localRepository';
import { ContractUpdater } from 'dlc-lib';
import { DlcManager } from 'dlc-lib';
import { DlcService } from 'app/dlcClasses/DlcService';
import { DlcSigner } from 'dlc-lib';
import { applyMiddleware } from 'redux';
import createSagaMiddleware from '@redux-saga/core';
import rootSaga from './root/saga';

export const storage = new ChromeStorage(chrome.storage.local, chrome.runtime);
const dlcStorage = new LocalRepository();
const blockchain = new DlcBitcoinBlockchain();
const dlcSigner = new DlcSigner();
const contractUpdater = new ContractUpdater(dlcSigner, blockchain);
const dlcManager = new DlcManager(contractUpdater, dlcStorage);

const rootPersistConfig = {
  key: 'root',
  storage,
  blacklist: ['nftDataState', 'walletState', 'dlcState'],
};

const WalletPersistConfig = {
  key: 'walletState',
  storage,
  blacklist: ['seedPhrase'],
};

const appReducer = combineReducers({
  walletState: persistReducer(WalletPersistConfig, walletReducer),
  nftDataState: NftDataStateReducer,
  dlcState: dlcReducer,
});

const rootReducer = (state: any, action: any) => appReducer(state, action);

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export type StoreState = ReturnType<typeof rootReducer>;

const rootStore = (() => {
  const sagaMiddleware = createSagaMiddleware({
    context: {
      dlcService: new DlcService(dlcManager, dlcStorage),
    },
  });
  const store = createStore(persistedReducer, applyMiddleware(sagaMiddleware));
  sagaMiddleware.run(rootSaga);
  const persistedStore = persistStore(store);
  return { store, persistedStore };
})();

export default rootStore;
