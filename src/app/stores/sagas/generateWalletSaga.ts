import { WALLET_DATA_VERSION } from 'app/core/constants/constants';
import { Account } from 'app/core/types/accounts';
import { newWallet } from 'app/core/wallet';
import { getGenerateWalletSuccessAction } from '@stores/actions/wallet/actionCreators';
import { GenerateWalletKey } from '@stores/actions/wallet/types';
import {
  getSelectedNetwork, saveAccountsList, saveSelectedAccount, saveWalletData,
} from '@utils/localStorage';
import { put, takeEvery } from 'redux-saga/effects';

export function* generateWallet() {
  const {
    stxAddress,
    btcAddress,
    masterPubKey,
    stxPublicKey,
    btcPublicKey,
    seedPhrase,
  } = yield newWallet();

  saveWalletData({
    stxAddress,
    btcAddress,
    masterPubKey,
    stxPublicKey,
    btcPublicKey,
    network: 'Mainnet',
    version: WALLET_DATA_VERSION,
    bnsName: '',
  });

  const accounts: Account[] = [
    {
      id: 0,
      stxAddress,
      btcAddress,
      masterPubKey,
      stxPublicKey,
      btcPublicKey,
    },
  ];
  saveAccountsList(accounts);
  saveSelectedAccount(accounts[0]);
  yield put(
    getGenerateWalletSuccessAction(
      stxAddress,
      btcAddress,
      masterPubKey,
      stxPublicKey,
      btcPublicKey,
      'Mainnet',
      accounts,
      '',
    ),
  );
}

export function* generateSTXWalletSaga() {
  yield takeEvery(GenerateWalletKey, generateWallet);
}
