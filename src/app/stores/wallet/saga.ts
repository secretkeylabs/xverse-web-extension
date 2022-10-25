import { takeEvery, put, call } from 'redux-saga/effects';
import {
  fetchBtcToCurrencyRate,
  fetchBtcTransactionsData,
  fetchStxAddressData,
  fetchStxToBtcRate,
  getCoinsInfo,
  getFtData,
} from '@secretkeylabs/xverse-core/api';
import { initialNetworksList, PAGINATION_LIMIT } from '@utils/constants';
import BigNumber from 'bignumber.js';
import {
  BtcAddressData,
  SettingsNetwork,
  StxAddressData,
  FungibleToken,
  CoinsResponse,
} from '@secretkeylabs/xverse-core/types';
import {
  FetchStxWalletDataRequestKey,
  FetchRates,
  FetchRatesKey,
  FetchStxWalletDataRequest,
  FetchBtcWalletDataRequest,
  FetchBtcWalletDataRequestKey,
  FetchCoinDataRequest,
  FetchCoinDataRequestKey,
} from './actions/types';
import {
  fetchBtcWalletDataFail,
  fetchBtcWalletDataSuccess,
  FetchCoinDataFailureAction,
  FetchCoinDataSuccessAction,
  fetchRatesFailAction,
  fetchRatesSuccessAction,
  fetchStxWalletDataFailureAction,
  fetchStxWalletDataSuccessAction,
} from './actions/actionCreators';

function* fetchRates(action: FetchRates) {
  try {
    const btcFiatRate: BigNumber = yield fetchBtcToCurrencyRate({
      fiatCurrency: action.fiatCurrency,
    });
    const stxBtcRate: BigNumber = yield fetchStxToBtcRate();
    yield put(fetchRatesSuccessAction(stxBtcRate, btcFiatRate));
  } catch (e: any) {
    yield put(fetchRatesFailAction(e.toString()));
  }
}

function* fetchStxWalletData(action: FetchStxWalletDataRequest) {
  try {
    const selectedNetwork: SettingsNetwork = action.network === 'Mainnet' ? initialNetworksList[0] : initialNetworksList[1];
    const stxData: StxAddressData = yield fetchStxAddressData(
      action.stxAddress,
      selectedNetwork,
      0,
      PAGINATION_LIMIT,
    );
    const stxBalance = stxData.balance;
    const stxAvailableBalance = stxData.availableBalance;
    const stxLockedBalance = stxData.locked;
    const stxTransactions = stxData.transactions;
    const stxNonce = stxData.nonce;
    yield put(
      fetchStxWalletDataSuccessAction(
        stxBalance,
        stxAvailableBalance,
        stxLockedBalance,
        stxTransactions,
        stxNonce,
      ),
    );
  } catch (error) {
    yield put(fetchStxWalletDataFailureAction());
  }
}

function* fetchBtcWalletData(action: FetchBtcWalletDataRequest) {
  try {
    const btcData: BtcAddressData = yield fetchBtcTransactionsData(
      action.btcAddress,
      action.network,
    );
    const btcBalance = new BigNumber(btcData.finalBalance);
    const btcTransactions = btcData.transactions;
    yield put(fetchBtcWalletDataSuccess(btcBalance, btcTransactions));
  } catch (error) {
    yield put(fetchBtcWalletDataFail());
  }
}

function* fetchCoinData(action: FetchCoinDataRequest) {
  try {
    const selectedNetwork: SettingsNetwork = action.network === 'Mainnet' ? initialNetworksList[0] : initialNetworksList[1];
    const fungibleTokenList: Array<FungibleToken> = yield call(
      getFtData,
      action.stxAddress,
      selectedNetwork,
    );
    const visibleCoins: FungibleToken[] | null = action.coinsList;
    if (visibleCoins) {
      visibleCoins.forEach((visibleCoin) => {
        const coinToBeUpdated = fungibleTokenList.find(
          (ft) => ft.principal === visibleCoin.principal,
        );
        if (coinToBeUpdated) coinToBeUpdated.visible = visibleCoin.visible;
        else if (visibleCoin.visible) {
          visibleCoin.balance = '0';
          fungibleTokenList.push(visibleCoin);
        }
      });
    } else {
      fungibleTokenList.forEach((ft) => {
        ft.visible = true;
      });
    }

    const contractids: string[] = [];
    // getting contract ids of all fts
    fungibleTokenList.forEach((ft) => {
      contractids.push(ft.principal);
    });
    const coinsReponse: CoinsResponse = yield call(getCoinsInfo, contractids, action.fiatCurrency);
    coinsReponse.forEach((coin) => {
      if (!coin.name) {
        coin.name = coin.contract.split('.')[1];
      }
    });

    // update attributes of fungible token list
    fungibleTokenList.forEach((ft) => {
      coinsReponse.forEach((coin) => {
        if (ft.principal === coin.contract) {
          ft.ticker = coin.ticker;
          ft.decimals = coin.decimals;
          ft.supported = coin.supported;
          ft.image = coin.image;
          ft.name = coin.name;
          ft.tokenFiatRate = coin.tokenFiatRate;
          coin.visible = ft.visible;
        }
      });
    });

    // sorting the list - moving supported to the top
    const supportedFts: FungibleToken[] = [];
    const unSupportedFts: FungibleToken[] = [];
    fungibleTokenList.forEach((ft) => {
      if (ft.supported) supportedFts.push(ft);
      else unSupportedFts.push(ft);
    });
    const sortedFtList: FungibleToken[] = [...supportedFts, ...unSupportedFts];
    yield put(FetchCoinDataSuccessAction(sortedFtList, coinsReponse));
  } catch (error: any) {
    yield put(FetchCoinDataFailureAction(error.toString()));
  }
}

export function* fetchRatesSaga() {
  yield takeEvery(FetchRatesKey, fetchRates);
}

export function* fetchStxWalletSaga() {
  yield takeEvery(FetchStxWalletDataRequestKey, fetchStxWalletData);
}

export function* fetchBtcWalletSaga() {
  yield takeEvery(FetchBtcWalletDataRequestKey, fetchBtcWalletData);
}

export function* fetchCoinDataSaga() {
  yield takeEvery(FetchCoinDataRequestKey, fetchCoinData);
}
