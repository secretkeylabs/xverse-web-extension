import { SettingsNetwork } from '@secretkeylabs/xverse-core/types';

export const BNS_CONTRACT = 'SP000000000000000000002Q6VF78.bns::names';
export const GAMMA_URL = 'https://gamma.io/';
export const TERMS_LINK = 'https://xverse.app/terms';
export const PRIVACY_POLICY_LINK = 'https://xverse.app/privacy';
export const SUPPORT_LINK = 'https://support.xverse.app/hc/en-us';
export const BTC_TRANSACTION_STATUS_URL = 'https://www.blockchain.com/btc/tx/';
export const TRANSACTION_STATUS_URL = 'https://explorer.stacks.co/txid/';
export const XVERSE_WEB_POOL_URL = 'https://pool.xverse.app';

export type CurrencyTypes = 'STX' | 'BTC' | 'FT' | 'NFT';
export enum LoaderSize {
  SMALLEST,
  SMALL,
  MEDIUM,
  LARGE,
}

export const BITCOIN_DUST_AMOUNT_SATS = 5500;
export const PAGINATION_LIMIT = 20;

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
