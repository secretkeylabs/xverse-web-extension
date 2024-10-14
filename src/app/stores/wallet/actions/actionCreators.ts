import { PostGuardPing } from '@components/guards/singleTab';
import type {
  Account,
  AccountType,
  AppInfo,
  FungibleToken,
  NetworkType,
  SettingsNetwork,
  SupportedCurrency,
} from '@secretkeylabs/xverse-core';
import * as actions from './types';

export function storeEncryptedSeedAction(encryptedSeed: string): actions.StoreEncryptedSeed {
  return {
    type: actions.StoreEncryptedSeedKey,
    encryptedSeed,
  };
}

export function resetWalletAction(): actions.ResetWallet {
  // We post the closeWallet action to the guard so that any open tabs will close
  PostGuardPing('closeWallet');
  return {
    type: actions.ResetWalletKey,
  };
}

export function updateSoftwareAccountsAction(
  accountsList: Account[],
): actions.UpdateSoftwareAccounts {
  return {
    type: actions.UpdateSoftwareAccountsKey,
    accountsList,
  };
}

export function updateLedgerAccountsAction(
  ledgerAccountsList: Account[],
): actions.UpdateLedgerAccounts {
  return {
    type: actions.UpdateLedgerAccountsKey,
    ledgerAccountsList,
  };
}

export function updateKeystoneAccountsAction(
  keystoneAccountsList: Account[],
): actions.UpdateKeystoneAccounts {
  return {
    type: actions.UpdateKeystoneAccountsKey,
    keystoneAccountsList,
  };
}

export function selectAccount(selectedAccount: Account): actions.SelectAccount;
export function selectAccount(
  selectedAccountIdx: number,
  accountType: AccountType,
): actions.SelectAccount;
export function selectAccount(
  selectedAccountOrIdx: Account | number,
  accountType?: AccountType,
): actions.SelectAccount {
  let selectedAccountIndex = selectedAccountOrIdx;

  let selectedAccountType = accountType ?? 'software';

  if (typeof selectedAccountIndex === 'object') {
    console.warn(
      'DEBUGPRINT[10]: actionCreators.ts:71: selectedAccountIndex=',
      selectedAccountIndex,
    );
    console.warn(
      'DEBUGPRINT[9]: actionCreators.ts:69: selectedAccountIndex.accountType=',
      selectedAccountIndex.accountType,
    );
    selectedAccountType = selectedAccountIndex.accountType ?? 'software';
    selectedAccountIndex = selectedAccountIndex.id;
  }

  console.warn('DEBUGPRINT[7]: actionCreators.ts:72: selectedAccountType=', selectedAccountType);
  console.warn('DEBUGPRINT[8]: actionCreators.ts:70: selectedAccountIndex=', selectedAccountIndex);

  return {
    type: actions.SelectAccountKey,
    selectedAccountIndex,
    selectedAccountType,
  };
}

export function setFeeMultiplierAction(feeMultipliers: AppInfo): actions.SetFeeMultiplier {
  return {
    type: actions.SetFeeMultiplierKey,
    feeMultipliers,
  };
}

export function ChangeFiatCurrencyAction(
  fiatCurrency: SupportedCurrency,
): actions.ChangeFiatCurrency {
  return {
    type: actions.ChangeFiatCurrencyKey,
    fiatCurrency,
  };
}

export function ChangeNetworkAction(network: SettingsNetwork): actions.ChangeNetwork {
  return {
    type: actions.ChangeNetworkKey,
    network,
  };
}

export function ChangeActivateOrdinalsAction(
  hasActivatedOrdinalsKey: boolean,
): actions.ChangeActivateOrdinals {
  return {
    type: actions.ChangeHasActivatedOrdinalsKey,
    hasActivatedOrdinalsKey,
  };
}

export function ChangeActivateRareSatsAction(
  hasActivatedRareSatsKey: boolean,
): actions.ChangeActivateRareSats {
  return {
    type: actions.ChangeHasActivatedRareSatsKey,
    hasActivatedRareSatsKey,
  };
}

export function ChangeActivateRBFAction(hasActivatedRBFKey: boolean): actions.ChangeActivateRBF {
  return {
    type: actions.ChangeHasActivatedRBFKey,
    hasActivatedRBFKey,
  };
}

export function SetRareSatsNoticeDismissedAction(
  rareSatsNoticeDismissed: boolean,
): actions.SetRareSatsNoticeDismissed {
  return {
    type: actions.RareSatsNoticeDismissedKey,
    rareSatsNoticeDismissed,
  };
}

export function ChangeShowBtcReceiveAlertAction(
  showBtcReceiveAlert: boolean | null,
): actions.ChangeShowBtcReceiveAlert {
  return {
    type: actions.ChangeShowBtcReceiveAlertKey,
    showBtcReceiveAlert,
  };
}

export function ChangeShowOrdinalReceiveAlertAction(
  showOrdinalReceiveAlert: boolean | null,
): actions.ChangeShowOrdinalReceiveAlert {
  return {
    type: actions.ChangeShowOrdinalReceiveAlertKey,
    showOrdinalReceiveAlert,
  };
}

export function changeShowDataCollectionAlertAction(
  showDataCollectionAlert: boolean | null,
): actions.ChangeShowDataCollectionAlert {
  return {
    type: actions.ChangeShowDataCollectionAlertKey,
    showDataCollectionAlert,
  };
}

export const setSip10ManageTokensAction = (params: {
  principal: string;
  isEnabled: boolean;
}): actions.SetSip10ManageTokens => ({
  type: actions.SetSip10ManageTokensKey,
  ...params,
});

export const setBrc20ManageTokensAction = (params: {
  principal: string;
  isEnabled: boolean;
}): actions.SetBrc20ManageTokens => ({
  type: actions.SetBrc20ManageTokensKey,
  ...params,
});

export const setRunesManageTokensAction = (params: {
  principal: string;
  isEnabled: boolean;
}): actions.SetRunesManageTokens => ({
  type: actions.SetRunesManageTokensKey,
  ...params,
});

export const setNotificationBannersAction = (params: {
  id: string;
  isDismissed: boolean;
}): actions.SetNotificationBanners => ({
  type: actions.SetNotificationBannersKey,
  ...params,
});

export function setWalletLockPeriodAction(
  walletLockPeriod: actions.WalletSessionPeriods,
): actions.SetWalletLockPeriod {
  return {
    type: actions.SetWalletLockPeriodKey,
    walletLockPeriod,
  };
}

export function setWalletUnlockedAction(isUnlocked: boolean): actions.SetWalletUnlocked {
  return {
    type: actions.SetWalletUnlockedKey,
    isUnlocked,
  };
}

export function setAccountBalanceAction(
  btcAddress: string,
  totalBalance: string,
): actions.SetAccountBalance {
  return {
    type: actions.SetAccountBalanceKey,
    btcAddress,
    totalBalance,
  };
}

export function setWalletHideStxAction(hideStx: boolean): actions.SetWalletHideStx {
  return {
    type: actions.SetWalletHideStxKey,
    hideStx,
  };
}

export function setSpamTokenAction(spamToken: FungibleToken | null): actions.SetSpamToken {
  return {
    type: actions.SetSpamTokenKey,
    spamToken,
  };
}

export function setSpamTokensAction(spamTokens: string[]): actions.SetSpamTokens {
  return {
    type: actions.SetSpamTokensKey,
    spamTokens,
  };
}

export function setShowSpamTokensAction(showSpamTokens: boolean): actions.SetShowSpamTokens {
  return {
    type: actions.SetShowSpamTokensKey,
    showSpamTokens,
  };
}

export const updateSavedNamesAction = (
  networkType: NetworkType,
  names: { id: number; name?: string }[],
): actions.UpdateSavedNames => ({
  type: actions.UpdateSavedNamesKey,
  networkType,
  names,
});

export function addToStarCollectiblesAction(params: {
  address: string;
  id: string;
  collectionId?: string;
}): actions.AddToStarCollectibles {
  return {
    type: actions.AddToStarCollectiblesKey,
    ...params,
  };
}

export function removeFromStarCollectiblesAction(params: {
  address: string;
  id: string;
}): actions.RemoveFromStarCollectibles {
  return {
    type: actions.RemoveFromStarCollectiblesKey,
    ...params,
  };
}

export function addToHideCollectiblesAction(params: {
  address: string;
  id: string;
}): actions.AddToHideCollectibles {
  return {
    type: actions.AddToHideCollectiblesKey,
    ...params,
  };
}

export function removeFromHideCollectiblesAction(params: {
  address: string;
  id: string;
}): actions.RemoveFromHideCollectibles {
  return {
    type: actions.RemoveFromHideCollectiblesKey,
    ...params,
  };
}

export function removeAllFromHideCollectiblesAction(params: {
  address: string;
}): actions.RemoveAllFromHideCollectibles {
  return {
    type: actions.RemoveAllFromHideCollectiblesKey,
    ...params,
  };
}

export function setAccountAvatarAction(params: {
  address: string;
  avatar: actions.AvatarInfo;
}): actions.SetAccountAvatar {
  return {
    type: actions.SetAccountAvatarKey,
    ...params,
  };
}

export function removeAccountAvatarAction(params: {
  address: string;
}): actions.RemoveAccountAvatar {
  return {
    type: actions.RemoveAccountAvatarKey,
    ...params,
  };
}
