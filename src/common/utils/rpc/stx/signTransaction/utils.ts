import { deserializeTransaction } from '@stacks/transactions';

/* eslint-disable import/prefer-default-export */
export function isValidStacksTransaction(txHex: string) {
  try {
    deserializeTransaction(txHex);
    return true;
  } catch (e) {
    return false;
  }
}
