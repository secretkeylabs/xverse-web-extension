const RoutePathsSuffixes = {
  SendNft: '/send-nft',
} as const;

const RoutePaths = {
  // Onboarding
  Legal: '/legal',
  RestoreWallet: '/restore-wallet',
  CreateWallet: '/create-wallet',

  ConfirmStacksTransaction: '/confirm-stx-tx',
  SendOrdinal: '/send-ordinal',
  SendBtc: '/send-btc',
  SendRune: '/send-rune',
  SendStx: '/send-stx',
  SendBrc20OneStep: '/send-brc20-one-step',
  SendInscriptionsRequest: '/send-inscriptions-request',
  TransferRunesRequest: '/transfer-runes-request',
  AccountList: '/account-list',
  Settings: '/settings',
  About: '/settings/about',
  Preferences: '/settings/preferences',
  Security: '/settings/security',
  AddressBook: '/settings/address-book',
  AddEditAddress: '/settings/address-book/manage/:id?',
  AddAddress: '/settings/address-book/manage',
  EditAddress: (id: string) => `/settings/address-book/manage/${id}`,
  AdvancedSettings: '/settings/advanced-settings',
  PreferredAddress: '/settings/preferred-address',
  FiatCurrency: '/settings/fiat-currency',
  ConnectedAppsAndPermissions: '/settings/connected-apps-and-permissions',
  PrivacyPreferences: '/settings/privacy-preferences',
  LockCountdown: '/settings/lock-countdown',
  RecoverFunds: '/settings/recover-funds',
  RecoverOrdinals: '/settings/recover-ordinals',
  RecoverRunes: '/settings/recover-runes',
  ChangeNetwork: '/settings/change-network',
  BackupWallet: '/settings/backup-wallet',
  ChangePassword: '/settings/change-password',
  ResetWallet: '/settings/reset-wallet',
} as const;

export default RoutePaths;
export { RoutePathsSuffixes };
