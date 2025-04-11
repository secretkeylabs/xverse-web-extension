/* eslint-disable prefer-destructuring */
import type { Provider } from '@sats-connect/core';
import type { NetworkType } from '@secretkeylabs/xverse-core';

export const GAMMA_URL = 'https://gamma.io/';
export const TERMS_LINK = 'https://xverse.app/terms';
export const PRIVACY_POLICY_LINK = 'https://xverse.app/privacy';
export const SUPPORT_LINK = 'https://support.xverse.app/hc/en-us';
export const STORE_LISTING =
  'https://chromewebstore.google.com/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg';
export const BLOG_LINK = 'https:/xverse.app/blog';
export const SUPPORT_EMAIL = 'support@xverse.app';
export const BTC_TRANSACTION_STATUS_URL = 'https://mempool.space/tx/';
export const BTC_TRANSACTION_TESTNET_STATUS_URL = 'https://mempool.space/testnet/tx/';
export const BTC_TRANSACTION_TESTNET4_STATUS_URL = 'https://mempool.space/testnet4/tx/';
export const BTC_TRANSACTION_SIGNET_STATUS_URL = 'https://mempool.space/signet/tx/';
export const BTC_TRANSACTION_REGTEST_STATUS_URL = 'https://mempool.bitcoin.regtest.hiro.so/tx/';
export const TRANSACTION_STATUS_URL = 'https://explorer.stacks.co/txid/';
export const XVERSE_STACKING_URL = 'https://wallet.xverse.app/earn/stacking';
export const XVERSE_EXPLORE_URL = 'https://wallet.xverse.app/explore';
export const XVERSE_POOL_ADDRESS = 'SPXVRSEH2BKSXAEJ00F1BY562P45D5ERPSKR4Q33';

const ordiViewSuffixMap: Record<NetworkType, string> = {
  Mainnet: '',
  Testnet4: '-testnet4',
  Testnet: '-testnet',
  Signet: '-signet',
  Regtest: '-signet',
};
export const XVERSE_ORDIVIEW_URL = (network: NetworkType) =>
  `https://ord${ordiViewSuffixMap[network]}.xverse.app`;

export const TRANSAC_URL = 'https://global.transak.com';
export const TRANSAC_API_KEY = process.env.TRANSAC_API_KEY;
export const MOON_PAY_URL = 'https://buy.moonpay.com';
export const MOON_PAY_API_KEY = process.env.MOON_PAY_API_KEY;
export const MIX_PANEL_TOKEN = process.env.MIX_PANEL_TOKEN;
export const MIX_PANEL_EXPLORE_APP_TOKEN = process.env.MIX_PANEL_EXPLORE_APP_TOKEN;

export const MAGIC_EDEN_RUNES_URL = 'https://magiceden.io/runes';

export type CurrencyTypes = 'STX' | 'BTC' | 'FT' | 'NFT' | 'Ordinal' | 'brc20-Ordinal' | 'RareSat';
export enum LoaderSize {
  SMALLEST,
  SMALL,
  MEDIUM,
  LARGE,
}

export const BITCOIN_DUST_AMOUNT_SATS = 546;
export const PAGINATION_LIMIT = 50;

/**
 * contract id of send_many transaction type
 */
export const SEND_MANY_TOKEN_TRANSFER_CONTRACT_PRINCIPAL =
  'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.send-many-memo';

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

export const MAX_ACC_NAME_LENGTH = 20;
// UI
export const ANIMATION_EASING = (progress: number) => 1 - (1 - progress) ** 3; // ease out (0, 0, 0.58, 1)
export const EMPTY_LABEL = '--';
export const HIDDEN_BALANCE_LABEL = '••••••';
export const BTC_SYMBOL = '₿';
export const OPTIONS_DIALOG_WIDTH = 179;
export const SPAM_OPTIONS_WIDTH = 244;
export const LONG_TOAST_DURATION = 4000;
export const POPUP_WIDTH = 375;

export const XverseProviderInfo: Provider = {
  id: 'XverseProviders.BitcoinProvider',
  name: 'Xverse Wallet',
  icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxNzE3MTciIGQ9Ik0wIDBoNjAwdjYwMEgweiIvPjxwYXRoIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTQ0MCA0MzUuNHYtNTFjMC0yLS44LTMuOS0yLjItNS4zTDIyMCAxNjIuMmE3LjYgNy42IDAgMCAwLTUuNC0yLjJoLTUxLjFjLTIuNSAwLTQuNiAyLTQuNiA0LjZ2NDcuM2MwIDIgLjggNCAyLjIgNS40bDc4LjIgNzcuOGE0LjYgNC42IDAgMCAxIDAgNi41bC03OSA3OC43Yy0xIC45LTEuNCAyLTEuNCAzLjJ2NTJjMCAyLjQgMiA0LjUgNC42IDQuNUgyNDljMi42IDAgNC42LTIgNC42LTQuNlY0MDVjMC0xLjIuNS0yLjQgMS40LTMuM2w0Mi40LTQyLjJhNC42IDQuNiAwIDAgMSA2LjQgMGw3OC43IDc4LjRhNy42IDcuNiAwIDAgMCA1LjQgMi4yaDQ3LjVjMi41IDAgNC42LTIgNC42LTQuNloiLz48cGF0aCBmaWxsPSIjRUU3QTMwIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGQ9Ik0zMjUuNiAyMjcuMmg0Mi44YzIuNiAwIDQuNiAyLjEgNC42IDQuNnY0Mi42YzAgNCA1IDYuMSA4IDMuMmw1OC43LTU4LjVjLjgtLjggMS4zLTIgMS4zLTMuMnYtNTEuMmMwLTIuNi0yLTQuNi00LjYtNC42TDM4NCAxNjBjLTEuMiAwLTIuNC41LTMuMyAxLjNsLTU4LjQgNTguMWE0LjYgNC42IDAgMCAwIDMuMiA3LjhaIi8+PC9nPjwvc3ZnPg==',
  webUrl: 'https://www.xverse.app/',
  chromeWebStoreUrl:
    'https://chrome.google.com/webstore/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg?hl=en-GB&authuser=1',
  googlePlayStoreUrl: 'https://play.google.com/store/apps/details?id=com.secretkeylabs.xverse',
  iOSAppStoreUrl: 'https://apps.apple.com/app/xverse-bitcoin-web3-wallet/id1552272513',
  methods: [
    'getInfo',
    'getAddresses',
    'getAccounts',
    'signMessage',
    'sendTransfer',
    'signPsbt',
    'stx_callContract',
    'stx_deployContract',
    'stx_getAccounts',
    'stx_getAddresses',
    'stx_signMessage',
    'stx_signStructuredMessage',
    'stx_signTransaction',
    'stx_transferStx',
  ],
};
