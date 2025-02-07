import type { Account, AccountType, BtcPaymentType } from '@secretkeylabs/xverse-core';
import { getAccountAddressDetails } from '@secretkeylabs/xverse-core';

type GetSelectedAccountProps = {
  selectedAccountType: AccountType;
  selectedAccountIndex: number;
  ledgerAccountsList: Account[];
  keystoneAccountsList: Account[];
  softwareAccountsList: Account[];
};

export type AccountWithDetails = Account & {
  btcAddress: string;
  btcPublicKey: string;
  btcXpub?: string;
  btcAddressType: BtcPaymentType;
  ordinalsAddress: string;
  ordinalsPublicKey: string;
  ordinalsXpub?: string;
};

export function embellishAccountWithDetails(
  account: Account,
  btcPaymentType: BtcPaymentType,
): AccountWithDetails;
export function embellishAccountWithDetails(
  account: undefined,
  btcPaymentType: BtcPaymentType,
): undefined;
export function embellishAccountWithDetails(
  account: Account | undefined,
  btcPaymentType: BtcPaymentType,
): AccountWithDetails | undefined {
  if (!account) {
    return undefined;
  }

  if (account.accountType === 'ledger' || account.accountType === 'keystone') {
    return {
      ...account,
      ...getAccountAddressDetails(account, 'native'),
      btcAddressType: 'native',
      // TODO vic: remove below 2 once we migrate to using Core which returns them in getAccountAddressDetails
      btcXpub: account.btcAddresses.native?.xpub,
      ordinalsXpub: account.btcAddresses.taproot.xpub,
    };
  }

  return {
    ...account,
    ...getAccountAddressDetails(account, btcPaymentType),
    btcAddressType: btcPaymentType,
  };
}

const getSelectedAccount = (props: GetSelectedAccountProps): Account | undefined => {
  const {
    selectedAccountType,
    selectedAccountIndex,
    ledgerAccountsList,
    keystoneAccountsList,
    softwareAccountsList,
  } = props;

  const accountList =
    selectedAccountType === 'software'
      ? softwareAccountsList
      : selectedAccountType === 'ledger'
      ? ledgerAccountsList
      : selectedAccountType === 'keystone'
      ? keystoneAccountsList
      : undefined;

  if (!accountList) {
    return undefined;
  }

  const selectedAccount = accountList.find((account) => account.id === selectedAccountIndex);

  return selectedAccount;
};

export default getSelectedAccount;
