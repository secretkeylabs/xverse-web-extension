import {all} from 'redux-saga/effects';
import { addAccountSaga } from "@stores/wallet/saga";


export function* rootSaga(){
    const sagasList = [
        addAccountSaga(),
    ]

    yield all(sagasList);
}