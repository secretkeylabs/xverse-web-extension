import {
  BitcoinEsploraApiProvider,
  getStacksInfo,
  microstacksToStx,
  satsToBtc,
  type Account,
  type FungibleToken,
  type NetworkType,
  type NftData,
  type SettingsNetwork,
  type StxMempoolTransactionData,
} from '@secretkeylabs/xverse-core';
import { ChainID } from '@stacks/transactions';
import { getFtBalance } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import type { TFunction } from 'react-i18next';
import {
  BTC_TRANSACTION_SIGNET_STATUS_URL,
  BTC_TRANSACTION_STATUS_URL,
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

export const getShortTruncatedAddress = (address: string) => {
  if (address) {
    return `${address.substring(0, 8)}...${address.substring(address.length - 8, address.length)}`;
  }
};

export const getExplorerUrl = (stxAddress: string): string =>
  `https://explorer.stacks.co/address/${stxAddress}?chain=mainnet`;

export const getStxTxStatusUrl = (transactionId: string, currentNetwork: SettingsNetwork): string =>
  `${TRANSACTION_STATUS_URL}${transactionId}?chain=${currentNetwork.type.toLowerCase()}`;

export const getBtcTxStatusUrl = (txId: string, network: SettingsNetwork) => {
  if (network.type === 'Testnet') {
    return `${BTC_TRANSACTION_TESTNET_STATUS_URL}${txId}`;
  }
  if (network.type === 'Signet') {
    return `${BTC_TRANSACTION_SIGNET_STATUS_URL}${txId}`;
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
  const networkChainId = type === 'Mainnet' ? ChainID.Mainnet : ChainID.Testnet;

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
  stxNetwork.chainId === ChainID.Mainnet ? 'Mainnet' : 'Testnet';

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
  accountsList: Account[],
  ledgerAccountsList: Account[],
) => {
  const regex = /^[a-zA-Z0-9 ]*$/;

  if (name.length > MAX_ACC_NAME_LENGTH) {
    return t('RENAME_ACCOUNT_MODAL.MAX_SYMBOLS_ERR', {
      maxLength: MAX_ACC_NAME_LENGTH,
    });
  }

  if (
    ledgerAccountsList.find((account) => account.accountName === name) ||
    accountsList.find((account) => account.accountName === name) ||
    accountsList.some(
      (account) =>
        `${t('ACCOUNT_NAME')} ${`${(account?.id ?? 0) + 1}`}` === name && !account.bnsName,
    )
  ) {
    return t('RENAME_ACCOUNT_MODAL.ALREADY_EXISTS_ERR');
  }

  if (!regex.test(name)) {
    return t('RENAME_ACCOUNT_MODAL.PROHIBITED_SYMBOLS_ERR');
  }

  return null;
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
  sipCoinsList: FungibleToken[];
  brcCoinsList: FungibleToken[];
  runesCoinList: FungibleToken[];
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
      if (coin.visible && coin.tokenFiatRate && coin.decimals) {
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
      if (coin.visible && coin.tokenFiatRate) {
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
      if (coin.visible && coin.tokenFiatRate) {
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
