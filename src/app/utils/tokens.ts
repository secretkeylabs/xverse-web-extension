import { FungibleToken } from '@secretkeylabs/xverse-core';
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
