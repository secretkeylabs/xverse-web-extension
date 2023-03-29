import { all } from 'redux-saga/effects';
import {
  handleAcceptSaga,
  handleContractsSaga,
  handleOfferSaga,
  handleRejectSaga,
  handleSignSaga,
} from '@stores/dlc/saga';

function* rootSaga() {
  const sagasList = [
    handleContractsSaga(),
    handleAcceptSaga(),
    handleOfferSaga(),
    handleRejectSaga(),
    handleSignSaga(),
  ];
  yield all(sagasList);
}

export default rootSaga;
