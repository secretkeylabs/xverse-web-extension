import { Account, StxMempoolTransactionData, SettingsNetwork } from '@secretkeylabs/xverse-core/types';
import { NftData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';
import { getStacksInfo } from '@secretkeylabs/xverse-core/api';
import BigNumber from 'bignumber.js';
import { ChainID } from '@stacks/transactions';
import { TRANSACTION_STATUS_URL } from './constants';

const validUrl = require('valid-url');

export function initBigNumber(num: string | number | BigNumber) {
  return BigNumber.isBigNumber(num) ? num : new BigNumber(num);
}

export function ftDecimals(value: number | string | BigNumber, decimals: number): string {
  const amount = initBigNumber(value);
  return amount.shiftedBy(-decimals).toNumber().toString();
}

export function convertAmountToFtDecimalPlaces(
  value: number | string | BigNumber,
  decimals: number,
): number {
  const amount = initBigNumber(value);
  return amount.shiftedBy(+decimals).toNumber();
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

export function getAddressDetail(account: Account) {
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

export function getStxTxStatusUrl(transactionId: string, currentNetwork: SettingsNetwork): string {
  return `${TRANSACTION_STATUS_URL}${transactionId}?chain=${currentNetwork.type.toLowerCase()}`;
}

export function getFetchableUrl(uri: string, protocol: string): string | undefined {
  const publicIpfs = 'https://cf-ipfs.com/ipfs';
  if (protocol === 'http') return uri;
  if (protocol === 'ipfs') {
    const url = uri.split('//');
    return `${publicIpfs}/${url[1]}`;
  }
  return undefined;
}
/**
 * check if nft transaction exists in pending transactions
 * @param pendingTransactions
 * @param nft
 * @returns true if nft exists, false otherwise
 */
export function checkNftExists(
  pendingTransactions: StxMempoolTransactionData[],
  nft: NftData,
): boolean {
  const principal: string[] = nft?.fully_qualified_token_id?.split('::');
  const transaction = pendingTransactions.find(
    (tx) => tx.contractCall?.contract_id === principal[0]
      && tx.contractCall.function_args[0].repr.substring(1)
      === nft.token_id.toString(),
  );
  if (transaction) return true;
  return false;
}

export async function isValidURL(str: string): Promise<boolean> {
  if (validUrl.isUri(str)) {
    const response = await getStacksInfo(str);
    if (response) {
      return true;
    }
  }
  return false;
}

export const getNetworkType = (stxNetwork) => (stxNetwork.chainId === ChainID.Mainnet ? 'Mainnet' : 'Testnet');
