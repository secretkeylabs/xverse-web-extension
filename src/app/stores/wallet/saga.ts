import {takeEvery, put, call, all, takeLatest} from 'redux-saga/effects';
import BN from "bn.js";
import { Account } from "@core/types/accounts";
import { walletFromSeedPhrase } from "@core/wallet";
import { getAccountsList, saveAccountsList } from "@utils/localStorage";
import { addAccountFailureAction, addAccoutSuccessAction } from "./actions/actionCreators";
import { AddAccountRequestAction,AddAccountRequestKey } from "./actions/types";

function* handleAddAccount(action: AddAccountRequestAction){
    try{
      let accountsList: Account[] = yield getAccountsList();
    const index = accountsList.length > 0 ? accountsList.length : 1;

    const {stxAddress, btcAddress, masterPubKey, stxPublicKey, btcPublicKey} =
      yield walletFromSeedPhrase(action.seed, new BN(index), action.network);

    const account: Account = {
      id: index,
      stxAddress,
      btcAddress,
      masterPubKey,
      stxPublicKey,
      btcPublicKey,
    };

    // add account in the list
    if (accountsList) {
      accountsList.push(account);
    } else {
      accountsList = [];
      accountsList.push(account);
    }
    console.log(accountsList)
    yield saveAccountsList(accountsList);
    yield put(addAccoutSuccessAction(accountsList));
  } catch (e:any) {
    yield put(addAccountFailureAction(e.toString()));
  }
}

export function* addAccountSaga() {
    yield takeEvery(AddAccountRequestKey, handleAddAccount);
}