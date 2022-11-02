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

export function isValidURL(str: string): boolean {
  const pattern = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  return !!pattern.test(str);
}
