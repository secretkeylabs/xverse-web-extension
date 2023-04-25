import { FungibleToken } from '@secretkeylabs/xverse-core';
import { ftDecimals, getTicker } from './helper';

export function getFtTicker(ft: FungibleToken) {
  if (ft?.ticker) {
    return ft.ticker.toUpperCase();
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
  return ft?.balance;
}
