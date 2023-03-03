import ChromeStorage from '@utils/storage';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import walletReducer from './wallet/walletReducer';
import rootSaga from './root/saga';
import NftDataStateReducer from './nftData/reducer';
import dlcReducer from './dlc/reducer';
import { DlcBitcoinBlockchain } from 'app/dlclib/DlcBlockchain';
import { LocalRepository } from 'app/dlclib/persistence/localRepository';
import { DlcBitcoinJSWallet } from 'app/dlclib/DlcBitcoinJSWallet';
import { regtest } from 'bitcoinjs-lib/src/networks'
import { ContractUpdater } from 'dlc-lib';
import { DlcManager } from 'dlc-lib';
import { DlcService } from 'app/dlclib/DlcService';

export const storage = new ChromeStorage(chrome.storage.local, chrome.runtime);
const dlcStorage = new LocalRepository()
const blockchain = new DlcBitcoinBlockchain();
const wallet = new DlcBitcoinJSWallet(dlcStorage, regtest, blockchain)
const contractUpdater = new ContractUpdater(wallet, blockchain)
const dlcManager = new DlcManager(contractUpdater, dlcStorage)

const rootPersistConfig = {
  key: 'root',
  storage,
  blacklist: ['nftDataState', 'walletState', 'dlcState'],
};

const WalletPersistConfig = {
  key: 'walletState',
  storage,
  blacklist: ['seedPhrase', 'hasRestoredMemoryKey'],
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
      dlcAPI: new DlcService(dlcManager, dlcStorage),
    },
  });
  const store = createStore(persistedReducer, applyMiddleware(sagaMiddleware));
  sagaMiddleware.run(rootSaga);
  const persistedStore = persistStore(store);
  return { store, persistedStore };
})();

export default rootStore;
