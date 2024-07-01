import {
  FungibleToken,
  microstacksToStx,
  satsToBtc,
  StxAddressData,
} from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { ftDecimals, getTicker } from './helper';

export function getFtTicker(ft: FungibleToken) {
  if (ft?.ticker) {
    return ft.protocol === 'brc-20' ? ft.ticker.toUpperCase() : ft.ticker;
  }
  if (ft?.name) {
    return getTicker(ft.name).toUpperCase();
  }
  return '';
}

export function getFtBalance(ft: FungibleToken) {
  if (ft && ft.decimals) {
    return ftDecimals(ft.balance, ft.decimals);
  }
  return BigNumber(ft?.balance).toFixed();
}

export function getBalanceAmount(
  currency: CurrencyTypes,
  ft?: FungibleToken,
  stxData?: StxAddressData,
  btcBalance?: number,
) {
  switch (currency) {
    case 'STX':
      return microstacksToStx(new BigNumber(stxData?.balance ?? 0)).toString();
    case 'BTC':
      return satsToBtc(new BigNumber(btcBalance ?? 0)).toString();
    case 'FT':
      return ft ? getFtBalance(ft) : '';
    default:
      return '';
  }
}
