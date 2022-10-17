import { all } from 'redux-saga/effects';
import {
  addAccountSaga,
  fetchBtcWalletSaga,
  fetchCoinDataSaga,
  fetchRatesSaga,
  fetchStxWalletSaga,
} from '@stores/wallet/saga';

export function* rootSaga() {
  const sagasList = [
    addAccountSaga(),
    fetchRatesSaga(),
    fetchStxWalletSaga(),
    fetchBtcWalletSaga(),
    fetchCoinDataSaga(),
  ];

  yield all(sagasList);
}
