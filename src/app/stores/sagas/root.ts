import { all } from 'redux-saga/effects';
import {
  updateBackupRemindSaga,
  fetchBackupRemindSaga,
} from './backupWalletSaga';
import { generateSTXWalletSaga } from './generateWalletSaga';

function* rootSaga() {
  const sagasList = [
    // User Preference Saga
    updateBackupRemindSaga(),
    fetchBackupRemindSaga(),
    // wallet
    generateSTXWalletSaga(),
  ];
  yield all(sagasList);
}
export default rootSaga;
