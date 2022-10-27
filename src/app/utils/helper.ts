import { Account } from '@stores/wallet/actions/types';
import BigNumber from 'bignumber.js';

export function initBigNumber(num: string | number | BigNumber) {
  return BigNumber.isBigNumber(num) ? num : new BigNumber(num);
}

export function ftDecimals(value: number | string | BigNumber, decimals: number): string {
  const amount = initBigNumber(value);
  return amount.shiftedBy(-decimals).toNumber().toString();
}

export function replaceCommaByDot(amount: string) {
  return amount.replace(/,/g, '.');
}

export const microStxToStx = (mStx: number | string | BigNumber) => {
  const microStacks = initBigNumber(mStx);
  return microStacks.shiftedBy(-6);
};

/**
 * get ticker from name
 */
export function getTicker(name: string) {
  if (name.includes('-')) {
    const parts = name.split('-');
    if (parts.length >= 3) {
      return `${parts[0][0]}${parts[1][0]}${parts[2][0]}`;
    }
    return `${parts[0][0]}${parts[1][0]}${parts[1][1]}`;
  }
  if (name.length >= 3) {
    return `${name[0]}${name[1]}${name[2]}`;
  }
  return name;
}

export function getAddressDetail(account:Account) {
  if (account) {
    return `${account.btcAddress.substring(0, 4)}...${account.btcAddress.substring(
      account.btcAddress.length - 4,
      account.btcAddress.length,
    )} / ${account.stxAddress.substring(0, 4)}...${account.stxAddress.substring(
      account.stxAddress.length - 4,
      account.stxAddress.length,
    )}`;
  }
  return '';
}

export function getExplorerUrl(stxAddress: string): string {
  return `https://explorer.stacks.co/address/${stxAddress}?chain=mainnet`;
}
