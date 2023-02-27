import { SettingsNetwork } from '@secretkeylabs/xverse-core/types';

export const BNS_CONTRACT = 'SP000000000000000000002Q6VF78.bns::names';
export const GAMMA_URL = 'https://gamma.io/';
export const TERMS_LINK = 'https://xverse.app/terms';
export const PRIVACY_POLICY_LINK = 'https://xverse.app/privacy';
export const SUPPORT_LINK = 'https://support.xverse.app/hc/en-us';
export const SUPPORT_EMAIL = 'support@xverse.app';
export const BTC_TRANSACTION_STATUS_URL = 'https://www.blockchain.com/btc/tx/';
export const BTC_TRANSACTION_TESTNET_STATUS_URL = 'https://live.blockcypher.com/btc-testnet/tx/';
export const TRANSACTION_STATUS_URL = 'https://explorer.stacks.co/txid/';
export const XVERSE_WEB_POOL_URL = 'https://pool.xverse.app';

export const TRANSAC_URL = 'https://global.transak.com';
export const TRANSAC_API_KEY = '8636faeb-2dd7-41e3-986e-b99db6f63903';
export const MOON_PAY_URL = 'https://buy.moonpay.com';
export const MOON_PAY_API_KEY = 'pk_live_8YeOjOzFqHUG1qi2G6NPA4N1tZAWFihK';
export const BINANCE_URL = 'https://www.binancecnt.com/en/pre-connect';
export const BINANCE_MERCHANT_CODE = 'secret_key_labs';

export type CurrencyTypes = 'STX' | 'BTC' | 'FT' | 'NFT' | 'Ordinal';
export enum LoaderSize {
  SMALLEST,
  SMALL,
  MEDIUM,
  LARGE,
}

export const BITCOIN_DUST_AMOUNT_SATS = 5500;
export const PAGINATION_LIMIT = 50;

export const initialNetworksList: SettingsNetwork[] = [
  {
    type: 'Mainnet',
    address: 'https://stacks-node-api.mainnet.stacks.co',
  },
  {
    type: 'Testnet',
    address: 'https://stacks-node-api.testnet.stacks.co',
  },
];

/**
 * contract id of send_many transaction type
 */
export const SEND_MANY_TOKEN_TRANSFER_CONTRACT_PRINCIPAL = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.send-many-memo';
