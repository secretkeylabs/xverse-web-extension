import { takeEvery, put, call, all, takeLatest } from 'redux-saga/effects';
import { walletFromSeedPhrase } from '@secretkeylabs/xverse-core/wallet';
import { addAccountFailureAction, addAccoutSuccessAction } from './actions/actionCreators';
import {
  Account,
  AddAccountRequest,
  AddAccountRequestKey,
  FetchWalletDataRequest,
} from './actions/types';

function* handleAddAccount(action: AddAccountRequest) {
  try {
    const index = action.accountsList.length > 0 ? action.accountsList.length : 1;

    const { stxAddress, btcAddress, masterPubKey, stxPublicKey, btcPublicKey } =
      yield walletFromSeedPhrase({
        mnemonic: action.seed,
        index: BigInt(index),
        network: action.network,
      });

    const account: Account = {
      id: index,
      stxAddress,
      btcAddress,
      masterPubKey,
      stxPublicKey,
      btcPublicKey,
    };
    const modifiedAccountList = [...action.accountsList];
    modifiedAccountList.push(account);
    yield put(addAccoutSuccessAction(modifiedAccountList));
  } catch (e: any) {
    yield put(addAccountFailureAction(e.toString()));
  }
}

export function* addAccountSaga() {
  yield takeEvery(AddAccountRequestKey, handleAddAccount);
}
