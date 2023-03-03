import { all, call, fork, put, takeEvery, getContext } from 'redux-saga/effects';
import {
  AcceptRequest,
  AcceptRequestKey,
  ContractRequestKey,
  OfferRequest,
  OfferRequestKey,
  RejectRequest,
  RejectRequestKey,
  SignRequest,
  SignRequestKey,
} from './actions/types';
import {
  contractError,
  contractSuccess,
  actionSuccess,
  actionError,
} from './actions/actionCreators';
import { AnyContract } from 'dlc-lib';
import { DlcAPI } from '../../dlclib/DlcAPI'

function* handleContracts() {
  try {
    const dlcAPI: DlcAPI = yield getContext('dlcAPI');
    const contracts = yield call([dlcAPI, dlcAPI.getAllContracts]);
    yield put(contractSuccess(contracts));
  } catch (err) {
    yield put(contractError('HandleContracts Effect Failure.'));
  }
}

function* handleOffer(action: OfferRequest) {
  try {
    const dlcAPI: DlcAPI = yield getContext('dlcAPI');
    const answer = yield call([dlcAPI, dlcAPI.processContractOffer], action.offerMessage);
    yield put(actionSuccess(answer));
  } catch {
    yield put(actionError({ error: 'HandleOffer Effect Failure.' }));
  }
}

function* handleAccept(action: AcceptRequest) {
  try {
    const dlcAPI: DlcAPI = yield getContext('dlcAPI');
    const answer = yield call([dlcAPI, dlcAPI.acceptContract], action.contractId);
    yield put(actionSuccess(answer));
  } catch (err) {
    yield put(
      actionError({ error: 'HandleAccept Effect Failure.', contractID: action.contractId })
    );
  }
}

function* handleReject(action: RejectRequest) {
  try {
    const dlcAPI: DlcAPI = yield getContext('dlcAPI');
    const answer = yield call([dlcAPI, dlcAPI.rejectContract], action.contractId);
    yield put(actionSuccess(answer));
  } catch (err) {
    yield put(
      actionError({ error: 'HandleReject Effect Failure.', contractID: action.contractId })
    );
  }
}

function* handleSign(action: SignRequest) {
  try {
    const dlcAPI: DlcAPI = yield getContext('dlcAPI');
    const answer = (yield call(
      [dlcAPI, dlcAPI.processContractSign],
      action.signMessage
    )) as AnyContract;
    yield put(actionSuccess(answer));
  } catch (err) {
    yield put(
      actionError({ error: `HandleSign Effect Failure. Message was: ${action.signMessage}` })
    );
  }
}

export function* handleContractsSaga() {
  yield takeEvery(ContractRequestKey, handleContracts);
}

export function* handleAcceptSaga() {
  yield takeEvery(AcceptRequestKey, handleAccept);
}

export function* handleOfferSaga() {
  yield takeEvery(OfferRequestKey, handleOffer);
}

export function* handleRejectSaga() {
  yield takeEvery(RejectRequestKey, handleReject);
}

export function* handleSignSaga() {
  yield takeEvery(SignRequestKey, handleSign);
}
