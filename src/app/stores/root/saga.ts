import { all } from 'redux-saga/effects';
import {
  fetchBtcWalletSaga,
  fetchCoinDataSaga,
  fetchRatesSaga,
  fetchStxWalletSaga,
} from '@stores/wallet/saga';

export function* rootSaga() {
  const sagasList = [
    fetchRatesSaga(),
    fetchStxWalletSaga(),
    fetchBtcWalletSaga(),
    fetchCoinDataSaga(),
  ];

  yield all(sagasList);
}
