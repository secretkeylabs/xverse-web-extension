import {
  BitcoinEsploraApiProvider,
  getStacksInfo,
  microstacksToStx,
  satsToBtc,
  StacksMainnet,
  StacksTestnet,
  type Account,
  type FungibleTokenWithStates,
  type NetworkType,
  type NftData,
  type SettingsNetwork,
  type StxMempoolTransactionData,
} from '@secretkeylabs/xverse-core';
import type { AddressBookEntry } from '@secretkeylabs/xverse-core/addressBook/types';
import { getFtBalance } from '@utils/tokens';
import RoutePaths, { RoutePathsSuffixes } from 'app/routes/paths';
import BigNumber from 'bignumber.js';
import type { TFunction } from 'react-i18next';
import {
  BTC_TRANSACTION_REGTEST_STATUS_URL,
  BTC_TRANSACTION_SIGNET_STATUS_URL,
  BTC_TRANSACTION_STATUS_URL,
  BTC_TRANSACTION_TESTNET4_STATUS_URL,
  BTC_TRANSACTION_TESTNET_STATUS_URL,
  MAX_ACC_NAME_LENGTH,
  TRANSACTION_STATUS_URL,
} from './constants';

const validUrl = require('valid-url');

export const initBigNumber = (num: string | number | BigNumber) =>
  BigNumber.isBigNumber(num) ? num : new BigNumber(num);

export const ftDecimals = (value: number | string | BigNumber, decimals: number): string => {
  const amount = initBigNumber(value);
  return amount.shiftedBy(-decimals).toString();
};

export const convertAmountToFtDecimalPlaces = (
  value: number | string | BigNumber,
  decimals: number,
): number => {
  const amount = initBigNumber(value);
  return amount.shiftedBy(+decimals).toNumber();
};

/**
 * return if < x decimals - otherwise return up to x decimals
 */
export const formatToXDecimalPlaces = (num: number, decimals: number): number => {
  // Convert the number to a string
  const numStr = num.toString();
  // Find the decimal point
  const decimalIndex = numStr.indexOf('.');
  // Check if there are more than x decimal places
  if (decimalIndex !== -1 && numStr.length - decimalIndex - 1 > decimals) {
    // Convert to 10 decimal places and return as a number
    return parseFloat(num.toFixed(decimals));
  }
  // Return the number as it is if it has 10 or fewer decimal places
  return num;
};

export const replaceCommaByDot = (amount: string) => amount.replace(/,/g, '.');

/**
 * get ticker from name
 */
export const getTicker = (name: string) => {
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
};

export const getTruncatedAddress = (address: string, lengthToShow = 4) =>
  `${address.substring(0, lengthToShow)}...${address.substring(
    address.length - lengthToShow,
    address.length,
  )}`;

export const getShortTruncatedAddress = (address: string, charCount = 8) => {
  if (address) {
    return `${address.substring(0, charCount)}...${address.substring(
      address.length - charCount,
      address.length,
    )}`;
  }
};

export const truncateStandardPrincipal = (standardPrincipal: string, length = 6) => {
  // Adding 2 because Stacks addresses always begin with two known characters.
  const leadingSubstringLength = length + 2;

  return `${standardPrincipal.substring(0, leadingSubstringLength)}...${standardPrincipal.substring(
    standardPrincipal.length - length,
  )}`;
};

export const truncateTextMiddle = (text: string, maxLength = 16) => {
  if (text.length > maxLength) {
    const partLength = Math.floor(maxLength / 2);

    const beginning = text.substring(0, partLength);
    const end = text.substring(text.length - partLength);

    return `${beginning}...${end}`;
  }
  return text;
};

const truncateContractName = (contractName: string, maxLength = 10) =>
  truncateTextMiddle(contractName, maxLength);

export const truncateContractPrincipal = (contractPrincipal: string) => {
  const [standardPrincipal, contractName] = contractPrincipal.split('.');

  const abbreviatedStandardPrincipal = truncateStandardPrincipal(standardPrincipal, 4);
  const abbreviatedContractName =
    contractName.length > 8 ? truncateContractName(contractName) : contractName;

  return `${abbreviatedStandardPrincipal}.${abbreviatedContractName}`;
};

export const getExplorerUrl = (stxAddress: string): string =>
  `https://explorer.stacks.co/address/${stxAddress}?chain=mainnet`;

export const getStxTxStatusUrl = (transactionId: string, currentNetwork: SettingsNetwork): string =>
  `${TRANSACTION_STATUS_URL}${transactionId}?chain=${currentNetwork.type.toLowerCase()}`;

export const getBtcTxStatusUrl = (txId: string, network: SettingsNetwork) => {
  if (network.type === 'Testnet') {
    return `${BTC_TRANSACTION_TESTNET_STATUS_URL}${txId}`;
  }
  if (network.type === 'Testnet4') {
    return `${BTC_TRANSACTION_TESTNET4_STATUS_URL}${txId}`;
  }
  if (network.type === 'Signet') {
    return `${BTC_TRANSACTION_SIGNET_STATUS_URL}${txId}`;
  }
  if (network.type === 'Regtest') {
    return `${BTC_TRANSACTION_REGTEST_STATUS_URL}${txId}`;
  }
  return `${BTC_TRANSACTION_STATUS_URL}${txId}`;
};

export const getFetchableUrl = (uri: string, protocol: string): string | undefined => {
  const publicIpfs = 'https://gamma.mypinata.cloud/ipfs';
  if (protocol === 'http') return uri;
  if (protocol === 'ipfs') {
    const url = uri.split('//');
    return `${publicIpfs}/${url[1]}`;
  }
  return undefined;
};
/**
 * check if nft transaction exists in pending transactions
 * @param pendingTransactions
 * @param nft
 * @returns true if nft exists, false otherwise
 */
export const checkNftExists = (
  pendingTransactions: StxMempoolTransactionData[],
  nft: NftData,
): boolean => {
  const principal: string[] = nft?.fully_qualified_token_id?.split('::');
  const transaction = pendingTransactions.find(
    (tx) =>
      tx.contractCall?.contract_id === principal[0] &&
      tx.contractCall.function_args[0].repr.substring(1) === nft.token_id.toString(),
  );
  if (transaction) return true;
  return false;
};

export const isValidStacksApi = async (url: string, type: NetworkType): Promise<boolean> => {
  const networkChainId = type === 'Mainnet' ? StacksMainnet.chainId : StacksTestnet.chainId;

  if (!validUrl.isUri(url)) {
    return false;
  }

  try {
    const response = await getStacksInfo(url);
    if (response) {
      if (response.network_id !== networkChainId) {
        // incorrect network
        return false;
      }
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
};

export const isValidBtcApi = async (url: string, network: NetworkType) => {
  if (!validUrl.isUri(url)) {
    return false;
  }

  const btcClient = new BitcoinEsploraApiProvider({
    network,
    url,
  });
  const defaultBtcClient = new BitcoinEsploraApiProvider({
    network,
  });

  try {
    if (network === 'Mainnet') {
      const [customHash, defaultHash] = await Promise.all([
        btcClient.getBlockHash(1),
        defaultBtcClient.getBlockHash(1),
      ]);
      // this ensures the URL is for correct network
      return customHash === defaultHash;
    }
    const blockHash = await btcClient.getBlockHash(1);
    return !!blockHash;
  } catch (e) {
    return false;
  }
};

export const getNetworkType = (stxNetwork) =>
  stxNetwork.chainId === StacksMainnet.chainId ? 'Mainnet' : 'Testnet';

export const getStxNetworkForBtcNetwork = (network: NetworkType) =>
  network === 'Mainnet' ? 'Mainnet' : 'Testnet';

export const isHardwareAccount = (account: Account | null): boolean =>
  !!account?.accountType && account?.accountType !== 'software';

export const isLedgerAccount = (account: Account | null): boolean =>
  account?.accountType === 'ledger';

export const isKeystoneAccount = (account: Account | null): boolean =>
  account?.accountType === 'keystone';

export const isInOptions = (): boolean => !!window.location?.pathname?.match(/options.html$/);

export const formatNumber = (value?: string | number) =>
  value ? new Intl.NumberFormat().format(Number(value)) : '-';

export const handleKeyDownFeeRateInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // only allow positive integers
  // disable common special characters, including - and .
  // eslint-disable-next-line no-useless-escape
  if (e.key.match(/^[!-\/:-@[-`{-~]$/)) {
    e.preventDefault();
  }
};

export const validateAccountName = (
  name: string,
  t: TFunction<'translation', 'OPTIONS_DIALOG'>,
  allAccounts: Account[],
) => {
  const validCharRegex = /^[a-zA-Z0-9 ]*$/;
  const genericAccountNameRegex = new RegExp(`^${t('ACCOUNT_NAME')} [0-9]+$`);

  if (name.length > MAX_ACC_NAME_LENGTH) {
    return t('RENAME_ACCOUNT_MODAL.MAX_SYMBOLS_ERR', {
      maxLength: MAX_ACC_NAME_LENGTH,
    });
  }

  if (genericAccountNameRegex.test(name)) {
    return t('RENAME_ACCOUNT_MODAL.INVALID_ACCOUNT_NAME');
  }

  if (allAccounts.some((account) => account.accountName === name)) {
    return t('RENAME_ACCOUNT_MODAL.ALREADY_EXISTS_ERR');
  }

  if (!validCharRegex.test(name)) {
    return t('RENAME_ACCOUNT_MODAL.PROHIBITED_SYMBOLS_ERR');
  }

  return null;
};

export const getAccountName = (
  account: Account | null | undefined,
  t: TFunction<'translation', 'COMMON'>,
) => {
  if (!account) return '';

  return (
    account.accountName ?? account.bnsName ?? `${t('ACCOUNT_NAME')} ${`${(account.id ?? 0) + 1}`}`
  );
};

/**
 * Gets the name of a recipient from either an account or an address book entry
 * @param recipientAddress The address to look up
 * @param allAccounts List of all wallet accounts
 * @param addressBookEntries List of address book entries
 * @param t Translation function with keyPrefix 'COMMON'
 * @returns The name of the recipient, or an empty string if not found
 */
export const getRecipientName = (
  recipientAddress: string,
  allAccounts: Account[],
  addressBookEntries: AddressBookEntry[],
  t: TFunction<'translation', 'COMMON'>,
): string => {
  // First look for the address in the address book
  const addressBookEntry = addressBookEntries.find((item) => item.address === recipientAddress);

  if (addressBookEntry) {
    return addressBookEntry.name;
  }

  // Then look for the address in accounts
  const accountWithAddress = allAccounts.find(
    (item) =>
      item.btcAddresses.taproot.address === recipientAddress ||
      item.btcAddresses.nested?.address === recipientAddress ||
      item.btcAddresses.native?.address === recipientAddress ||
      item.stxAddress === recipientAddress,
  );

  if (accountWithAddress) {
    return getAccountName(accountWithAddress, t);
  }

  // Return empty string if not found
  return '';
};

export const getAccountBalanceKey = (account: Account | null) => {
  if (!account) return '';
  return `${account.accountType}-${account.id}`;
};

export const calculateTotalBalance = ({
  stxBalance,
  btcBalance,
  sipCoinsList,
  brcCoinsList,
  runesCoinList,
  stxBtcRate,
  btcFiatRate,
  hideStx,
}: {
  stxBalance?: string;
  btcBalance?: string;
  sipCoinsList: FungibleTokenWithStates[];
  brcCoinsList: FungibleTokenWithStates[];
  runesCoinList: FungibleTokenWithStates[];
  stxBtcRate: string;
  btcFiatRate: string;
  hideStx: boolean;
}) => {
  let totalBalance = new BigNumber(0);

  if (stxBalance && !hideStx) {
    const stxFiatEquiv = microstacksToStx(new BigNumber(stxBalance))
      .multipliedBy(new BigNumber(stxBtcRate))
      .multipliedBy(new BigNumber(btcFiatRate));
    totalBalance = totalBalance.plus(stxFiatEquiv);
  }

  if (btcBalance) {
    const btcFiatEquiv = satsToBtc(new BigNumber(btcBalance)).multipliedBy(
      new BigNumber(btcFiatRate),
    );
    totalBalance = totalBalance.plus(btcFiatEquiv);
  }

  if (sipCoinsList) {
    totalBalance = sipCoinsList.reduce((acc, coin) => {
      if (coin.isEnabled && coin.tokenFiatRate && coin.decimals) {
        const tokenUnits = new BigNumber(10).exponentiatedBy(new BigNumber(coin.decimals));
        const coinFiatValue = new BigNumber(coin.balance)
          .dividedBy(tokenUnits)
          .multipliedBy(new BigNumber(coin.tokenFiatRate));
        return acc.plus(coinFiatValue);
      }

      return acc;
    }, totalBalance);
  }

  if (brcCoinsList) {
    totalBalance = brcCoinsList.reduce((acc, coin) => {
      if (coin.isEnabled && coin.tokenFiatRate) {
        const coinFiatValue = new BigNumber(coin.balance).multipliedBy(
          new BigNumber(coin.tokenFiatRate),
        );
        return acc.plus(coinFiatValue);
      }

      return acc;
    }, totalBalance);
  }

  if (runesCoinList) {
    totalBalance = runesCoinList.reduce((acc, coin) => {
      if (coin.isEnabled && coin.tokenFiatRate) {
        const coinFiatValue = new BigNumber(getFtBalance(coin)).multipliedBy(
          new BigNumber(coin.tokenFiatRate),
        );
        return acc.plus(coinFiatValue);
      }

      return acc;
    }, totalBalance);
  }

  return totalBalance.toNumber().toFixed(2);
};

export const getLockCountdownLabel = (
  period: number,
  t: TFunction<'translation', 'SETTING_SCREEN'>,
) => {
  if (period < 60) {
    return t('LOCK_COUNTDOWN_MIN', { count: period });
  }
  const hours = period / 60;
  return t('LOCK_COUNTDOWN_HS', { count: hours });
};

export const satsToBtcString = (num: BigNumber) =>
  satsToBtc(num)
    .toFixed(8)
    .replace(/\.?0+$/, '');

export const sanitizeRuneName = (runeName) => runeName.replace(/[^A-Za-z]+/g, '').toUpperCase();

export type TabType = 'dashboard' | 'nft' | 'stacking' | 'explore' | 'settings';

export const getActiveTab = (currentPath: string): TabType => {
  if (
    currentPath.includes('/nft-dashboard') ||
    currentPath.includes('/ordinal-detail') ||
    currentPath.includes(RoutePaths.SendOrdinal) ||
    currentPath.includes(RoutePathsSuffixes.SendNft)
  ) {
    return 'nft';
  }

  if (currentPath.includes('/stacking')) {
    return 'stacking';
  }

  if (currentPath.includes('/explore')) {
    return 'explore';
  }

  if (currentPath.includes(RoutePaths.Settings)) {
    return 'settings';
  }

  // Default to dashboard for all other routes
  return 'dashboard';
};
