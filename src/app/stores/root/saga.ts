import { all } from 'redux-saga/effects';
import {
  fetchBtcWalletSaga,
  fetchCoinDataSaga,
  fetchRatesSaga,
  fetchStxWalletSaga,
} from '@stores/wallet/saga';
import {
  handleAcceptSaga,
  handleContractsSaga,
  handleOfferSaga,
  handleRejectSaga,
  handleSignSaga,
} from '@stores/dlc/saga';

function* rootSaga() {
  const sagasList = [
    fetchRatesSaga(),
    fetchStxWalletSaga(),
    fetchBtcWalletSaga(),
    fetchCoinDataSaga(),
    handleContractsSaga(),
    handleAcceptSaga(),
    handleOfferSaga(),
    handleRejectSaga(),
    handleSignSaga(),
  ];
  yield all(sagasList);
}

export default rootSaga;
