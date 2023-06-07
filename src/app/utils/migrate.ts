// import rootStore, { WalletPersistConfig, storage } from '@stores/index';
// import { setWalletAction, storeEncryptedSeedAction } from '@stores/wallet/actions/actionCreators';
// import { WalletState } from '@stores/wallet/actions/types';
// import { getStoredState, RehydrateAction } from 'redux-persist';

// const storageKey = 'persist:walletState';

// const migrateCachedStorage = async () => {
//   const hasMigrated = localStorage.getItem('migrated');
//   if (!hasMigrated) {
//     const existingStorage = await getStoredState(WalletPersistConfig);
//     if (existingStorage) {
//       const userState = (existingStorage as WalletState);
//       console.log('🚀 ~ file: migrate.ts:14 ~ migrateCachedStorage ~ userState:', userState);
//       await chrome.storage.local.clear();
//       // rootStore.persistedStore.purge();
//       // rootStore.store.dispatch(storeEncryptedSeedAction(userState.encryptedSeed));
//       rootStore.persistedStore.dispatch({
//         type: 'persist/REHYDRATE',
//         key: storageKey,
//         payload: userState,
//       });
//       // rootStore.persistedStore.dispatch({
//       // type: 'persist/REGISTER',
//       // key: storageKey,
//       // });
//       // localStorage.setItem('migrated', 'true');
//     }
//   }
// };

// export default migrateCachedStorage;
