import { all } from 'redux-saga/effects';
import {
  fetchBtcWalletSaga,
  fetchCoinDataSaga,
  fetchRatesSaga,
  fetchStxWalletSaga,
} from '@stores/wallet/saga';

function* rootSaga() {
  const sagasList = [
    fetchRatesSaga(),
    fetchStxWalletSaga(),
    fetchBtcWalletSaga(),
    fetchCoinDataSaga(),
  ];

  yield all(sagasList);
}

export default rootSaga;
