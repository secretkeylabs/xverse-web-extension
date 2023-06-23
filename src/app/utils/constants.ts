/* eslint-disable prefer-destructuring */
import {
  BTC_BASE_URI_MAINNET, BTC_BASE_URI_TESTNET, HIRO_MAINNET_DEFAULT, HIRO_TESTNET_DEFAULT,
} from '@secretkeylabs/xverse-core/constant';
import { SettingsNetwork } from '@secretkeylabs/xverse-core/types';

export const BNS_CONTRACT = 'SP000000000000000000002Q6VF78.bns::names';
export const GAMMA_URL = 'https://gamma.io/';
export const TERMS_LINK = 'https://xverse.app/terms';
export const PRIVACY_POLICY_LINK = 'https://xverse.app/privacy';
export const SUPPORT_LINK = 'https://support.xverse.app/hc/en-us';
export const SUPPORT_EMAIL = 'support@xverse.app';
export const BTC_TRANSACTION_STATUS_URL = 'https://mempool.space/tx/';
export const BTC_TRANSACTION_TESTNET_STATUS_URL = 'https://mempool.space/testnet/tx/';
export const TRANSACTION_STATUS_URL = 'https://explorer.stacks.co/txid/';
export const XVERSE_WEB_POOL_URL = 'https://pool.xverse.app';

export const TRANSAC_URL = 'https://global.transak.com';
export const TRANSAC_API_KEY = process.env.TRANSAC_API_KEY;
export const MOON_PAY_URL = 'https://buy.moonpay.com';
export const MOON_PAY_API_KEY = process.env.MOON_PAY_API_KEY;
export const BINANCE_URL = 'https://www.binancecnt.com/en/pre-connect';
export const BINANCE_MERCHANT_CODE = process.env.BINANCE_MERCHANT_CODE;

export type CurrencyTypes = 'STX' | 'BTC' | 'FT' | 'NFT' | 'Ordinal' | 'brc20' | 'brc20-Ordinal';
export enum LoaderSize {
  SMALLEST,
  SMALL,
  MEDIUM,
  LARGE,
}

export const BITCOIN_DUST_AMOUNT_SATS = 5500;
export const PAGINATION_LIMIT = 50;
export const REFETCH_UNSPENT_UTXO_TIME = 2 * 60 * 60 * 1000;

export const initialNetworksList: SettingsNetwork[] = [
  {
    type: 'Mainnet',
    address: HIRO_MAINNET_DEFAULT,
    btcApiUrl: BTC_BASE_URI_MAINNET,
  },
  {
    type: 'Testnet',
    address: HIRO_TESTNET_DEFAULT,
    btcApiUrl: BTC_BASE_URI_TESTNET,
  },
];

/**
 * contract id of send_many transaction type
 */
export const SEND_MANY_TOKEN_TRANSFER_CONTRACT_PRINCIPAL = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.send-many-memo';
