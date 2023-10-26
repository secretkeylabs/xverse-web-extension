/* eslint-disable prefer-destructuring */
import {
  BTC_BASE_URI_MAINNET,
  BTC_BASE_URI_TESTNET,
  HIRO_MAINNET_DEFAULT,
  HIRO_TESTNET_DEFAULT,
} from '@secretkeylabs/xverse-core/constant';
import { NetworkType, SettingsNetwork } from '@secretkeylabs/xverse-core/types';

export const BNS_CONTRACT = 'SP000000000000000000002Q6VF78.bns::names';
export const GAMMA_URL = 'https://gamma.io/';
export const TERMS_LINK = 'https://xverse.app/terms';
export const PRIVACY_POLICY_LINK = 'https://xverse.app/privacy';
export const SUPPORT_LINK = 'https://support.xverse.app/hc/en-us';
export const BLOG_LINK = 'https:/xverse.app/blog';
export const SUPPORT_EMAIL = 'support@xverse.app';
export const BTC_TRANSACTION_STATUS_URL = 'https://mempool.space/tx/';
export const BTC_TRANSACTION_TESTNET_STATUS_URL = 'https://mempool.space/testnet/tx/';
export const TRANSACTION_STATUS_URL = 'https://explorer.stacks.co/txid/';
export const XVERSE_WEB_POOL_URL = 'https://pool.xverse.app';

export const XVERSE_ORDIVIEW_URL = (network: NetworkType) =>
  `https://ord${network === 'Mainnet' ? '' : '-testnet'}.xverse.app`;

export const MAGISAT_IO_RARITY_SCAN_URL = 'https://magisat.io/wallet?walletAddress=';

export const TRANSAC_URL = 'https://global.transak.com';
export const TRANSAC_API_KEY = process.env.TRANSAC_API_KEY;
export const MOON_PAY_URL = 'https://buy.moonpay.com';
export const MOON_PAY_API_KEY = process.env.MOON_PAY_API_KEY;
export const MIX_PANEL_TOKEN = process.env.MIX_PANEL_TOKEN;

export type CurrencyTypes =
  | 'STX'
  | 'BTC'
  | 'FT'
  | 'NFT'
  | 'Ordinal'
  | 'brc20'
  | 'brc20-Ordinal'
  | 'RareSat';
export enum LoaderSize {
  SMALLEST,
  SMALL,
  MEDIUM,
  LARGE,
}

export const BITCOIN_DUST_AMOUNT_SATS = 1500;
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
export const SEND_MANY_TOKEN_TRANSFER_CONTRACT_PRINCIPAL =
  'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.send-many-memo';

export const SWAP_SPONSOR_DISABLED_SUPPORT_URL =
  'https://support.xverse.app/hc/en-us/articles/18319388355981';
export const SUPPORT_URL_TAB_TARGET = 'SupportURLTabTarget';

export const DEFAULT_TRANSITION_OPTIONS = {
  from: {
    x: 24,
    opacity: 0,
  },
  enter: {
    x: 0,
    opacity: 1,
  },
};
