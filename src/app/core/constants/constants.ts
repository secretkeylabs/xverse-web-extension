import { Network } from 'app/core/types/networks';

export type CurrencyTypes = 'STX' | 'BTC' | 'FT' | 'NFT';

export type AuthenticationState =
  | 'Authenticated'
  | 'NotAuthenticated'
  | 'Loading'
  | 'ShouldAuthenticate'
  | 'ShouldAuthenticatePassword';

export type StackingState =
  | 'Loading'
  | 'NotStacking'
  | 'Pending'
  | 'Delegated'
  | 'Stacking'
  | 'Completed'
  | 'Revoked'
  | 'Error';

export const ENTROPY_BYTES = 16;

export interface SettingsNetwork {
  name: Network;
  address: string;
}

export const initialNetworksList: SettingsNetwork[] = [
  {
    name: 'Mainnet',
    address: 'https://stacks-node-api.mainnet.stacks.co',
  },
  {
    name: 'Testnet',
    address: 'https://stacks-node-api.testnet.stacks.co',
  },
];

export type NftType = 'Image' | 'Video';

/**
 * pagination limit of confirmed and mempool transactions
 */
export const PAGINATION_LIMIT = 20;

export const BTC_PATH = 'm/49\'/0\'/0\'/0/0';

export const BTC_PATH_WITHOUT_INDEX = 'm/49\'/0\'/0\'/0/';

export const BTC_TESTNET_PATH_WITHOUT_INDEX = 'm/49\'/1\'/0\'/0/';

export const STX_PATH_WITHOUT_INDEX = 'm/44\'/5757\'/0\'/0/';

export const WALLET_DATA_VERSION = 1;

export const BITCOIN_DUST_AMOUNT_SATS = 5500;

export const BNS_CONTRACT_PRINCIPAL = 'SP000000000000000000002Q6VF78.bns';

/**
 * if the app is in background and comes to foreground after the refresh time
 * the app data should be refresh
 */
export const REFRESH_TIME = 5;

/**
 * contract id of send_many transaction type
 */
export const SEND_MANY_TOKEN_TRANSFER_CONTRACT_PRINCIPAL = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.send-many-memo';

export const WEAK_PASSWORD_LENGTH = 5;
export const MEDIUM_PASSWORD_LENGTH = 8;
export const STRONG_PASSWORD_LENGTH = 12;

/**
 * terms of service and privacy policy links
 */
export const TERMS_LINK = 'https://xverse.app/terms';
export const PRIVACY_POLICY_LINK = 'https://xverse.app/privacy';

export const STACKING_URL = 'https://docs.stacks.co/understand-stacks/stacking';
export const BRINK_STACKING_URL = 'https://bitcoinlove.stacks.org';

/**
 * btc base urls
 */
export const BTC_BASE_URI_MAINNET = 'https://api.blockcypher.com/v1/btc/main/addrs/';
export const BTC_BASE_URI_TESTNET = 'https://api.blockcypher.com/v1/btc/test3/addrs/';

export const READ_MORE_SIP_012_LINK = 'https://github.com/hirosystems/sips/blob/draft/sip-012/sips/sip-012/sip-012-cost-limits-network-upgrade.md';

export const CYCLE_FOR_VOTE = 21;

/**
 * multiply stx transaction fees by this number
 */
export const STX_FEE_MULTIPLIER = 50;

export const STX_DELEGATION_FEE_MULTIPLIER = 1700;

/**
 * change this base url to localhost url for testing
 * prod base url: https://api.xverse.app
 */
export const XVERSE_API_BASE_URL_PROD = 'https://api.xverse.app';
export const XVERSE_API_BASE_URL_TEST = 'http://localhost:3000';

export const XVERSE_API_BASE_URL = XVERSE_API_BASE_URL_PROD;

/**
 * minimum stx to stack for bitcoin for brink stacking
 */
export const MIN_BTC_BRINK_STACKING = 10;

export const BRINK_STACKING_CONTRACT_NAME = 'bitcoin-brink-pool';

export const STX_STACKING_CONTRACT_NAME = 'xverse-pool-v2';

export const AVAILABLE_SEARCH_ENGINES = [
  'google',
  'bing',
  'duckduckgo',
  'yahoo',
] as const;

export const STX_NFT_LINK = 'https://stxnft.com/';

export const BNS_CONTRACT = 'SP000000000000000000002Q6VF78.bns::names';

export const TRANSAC_URL = 'https://global.transak.com';
export const TRANSAC_API_KEY = '8636faeb-2dd7-41e3-986e-b99db6f63903';

export const MOON_PAY_URL = 'https://buy.moonpay.com';
export const MOON_PAY_API_KEY = 'pk_live_8YeOjOzFqHUG1qi2G6NPA4N1tZAWFihK';
export const MIX_PANEL_TOKEN: string = 'eebe8b99e520e760aa38f222b7de0ccf';
