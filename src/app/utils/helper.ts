import {
  Account,
  BitcoinEsploraApiProvider,
  getStacksInfo,
  NetworkType,
  NftData,
  SettingsNetwork,
  StxMempoolTransactionData,
} from '@secretkeylabs/xverse-core';
import { ChainID } from '@stacks/transactions';
import BigNumber from 'bignumber.js';
import {
  BTC_TRANSACTION_STATUS_URL,
  BTC_TRANSACTION_TESTNET_STATUS_URL,
  TRANSACTION_STATUS_URL,
} from './constants';

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

export function getTruncatedAddress(address: string, lengthToShow = 4) {
  return `${address.substring(0, lengthToShow)}...${address.substring(
    address.length - lengthToShow,
    address.length,
  )}`;
}

export function getShortTruncatedAddress(address: string) {
  if (address) {
    return `${address.substring(0, 8)}...${address.substring(address.length - 8, address.length)}`;
  }
}

export function getAddressDetail(account: Account) {
  if (account.btcAddress && account.stxAddress) {
    return `${getTruncatedAddress(account.btcAddress)} / ${getTruncatedAddress(
      account.stxAddress,
    )}`;
  }
  if (account.btcAddress || account.stxAddress) {
    const existingAddress = account.btcAddress || account.stxAddress;
    return getTruncatedAddress(existingAddress);
  }
  return '';
}

export function getExplorerUrl(stxAddress: string): string {
  return `https://explorer.stacks.co/address/${stxAddress}?chain=mainnet`;
}

export function getStxTxStatusUrl(transactionId: string, currentNetwork: SettingsNetwork): string {
  return `${TRANSACTION_STATUS_URL}${transactionId}?chain=${currentNetwork.type.toLowerCase()}`;
}

export function getBtcTxStatusUrl(txId: string, network: SettingsNetwork) {
  if (network.type === 'Testnet') {
    return `${BTC_TRANSACTION_TESTNET_STATUS_URL}${txId}`;
  }
  return `${BTC_TRANSACTION_STATUS_URL}${txId}`;
}

export function getFetchableUrl(uri: string, protocol: string): string | undefined {
  const publicIpfs = 'https://gamma.mypinata.cloud/ipfs';
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
    (tx) =>
      tx.contractCall?.contract_id === principal[0] &&
      tx.contractCall.function_args[0].repr.substring(1) === nft.token_id.toString(),
  );
  if (transaction) return true;
  return false;
}

export async function isValidStacksApi(url: string, type: NetworkType): Promise<boolean> {
  const networkChainId = type === 'Mainnet' ? ChainID.Mainnet : ChainID.Testnet;
  if (validUrl.isUri(url)) {
    const response = await getStacksInfo(url);
    if (response) {
      if (response.network_id !== networkChainId) {
        throw new Error('URL not compatible with current Network');
      }
      return true;
    }
  }
  throw new Error('Invalid URL');
}

export async function isValidBtcApi(url: string, network: NetworkType) {
  if (validUrl.isUri(url)) {
    const btcClient = new BitcoinEsploraApiProvider({
      network,
      url,
    });
    const response = await btcClient.getLatestBlockHeight();
    if (response) {
      return true;
    }
  }
  throw new Error('Invalid URL');
}

export const getNetworkType = (stxNetwork) =>
  stxNetwork.chainId === ChainID.Mainnet ? 'Mainnet' : 'Testnet';

export const isHardwareAccount = (account: Account | null): boolean =>
  !!account?.accountType && account?.accountType !== 'software';

export const isLedgerAccount = (account: Account | null): boolean =>
  account?.accountType === 'ledger';

export const isInOptions = (): boolean => !!window.location?.pathname?.match(/options.html$/);
