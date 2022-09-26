import { put, takeLatest } from 'redux-saga/effects';
import {
  getUserPrefBackupRemind,
  saveUserPrefBackupRemind,
} from '@utils/localStorage';
import { setBackupRemindAction } from '../actions/userPreferences/actionCreators';
import {
  UpdateBackupRemind,
  UpdateBackupRemindKey,
  FetchBackupRemindKey,
} from '../actions/userPreferences/types';

function* updateBackupRemind(action: UpdateBackupRemind) {
  yield saveUserPrefBackupRemind(String(action.nextBackupRemind));
}

function* fetchBackupRemind() {
  const backupRemind: string = yield getUserPrefBackupRemind();
  if (backupRemind && backupRemind !== 'undefined') { yield put(setBackupRemindAction(new Date(backupRemind))); }
}

export function* updateBackupRemindSaga() {
  yield takeLatest(UpdateBackupRemindKey, updateBackupRemind);
}

export function* fetchBackupRemindSaga() {
  yield takeLatest(FetchBackupRemindKey, fetchBackupRemind);
}
