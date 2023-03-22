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
import { DlcAPI } from 'dlc-lib/src/interfaces';

function* handleContracts() {
  try {
    const dlcService: DlcAPI = yield getContext('dlcService');
    const contracts = yield call([dlcService, dlcService.getAllContracts]);
    yield put(contractSuccess(contracts));
  } catch (err) {
    yield put(contractError('HandleContracts Effect Failure.'));
  }
}

function* handleOffer(action: OfferRequest) {
  try {
    const dlcService: DlcAPI = yield getContext('dlcService');
    const answer = yield call([dlcService, dlcService.processContractOffer], action.offerMessage);
    yield put(actionSuccess(answer));
  } catch {
    yield put(actionError({ error: 'HandleOffer Effect Failure.' }));
  }
}

function* handleAccept(action: AcceptRequest) {
  try {
    const dlcService: DlcAPI = yield getContext('dlcService');
    const answer = yield call(
      [dlcService, dlcService.acceptContract],
      action.contractId,
      action.btcAddress,
      action.btcPublicKey,
      action.btcPrivateKey,
      action.network
    );
    yield put(actionSuccess(answer));
  } catch (err) {
    yield put(
      actionError({ error: `HandleAccept Effect Failure: ${err}`, contractID: action.contractId })
    );
  }
}

function* handleReject(action: RejectRequest) {
  try {
    const dlcService: DlcAPI = yield getContext('dlcService');
    const answer = yield call([dlcService, dlcService.rejectContract], action.contractId);
    yield put(actionSuccess(answer));
  } catch (err) {
    yield put(
      actionError({ error: 'HandleReject Effect Failure.', contractID: action.contractId })
    );
  }
}

function* handleSign(action: SignRequest) {
  try {
    const dlcService: DlcAPI = yield getContext('dlcService');
    console.log('handleSign', action.counterpartyWalletURL)
    const answer = (yield call(
      [dlcService, dlcService.processContractSign],
      action.contractId,
      action.btcPrivateKey,
      action.btcNetwork,
      action.counterpartyWalletURL
    )) as AnyContract;
    yield put(actionSuccess(answer));
  } catch (err) {
    yield put(
      actionError({ error: `HandleSign Effect Failure.` })
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
