import type { Account, AccountType, BtcPaymentType } from '@secretkeylabs/xverse-core';
import { getAccountAddressDetails } from '@secretkeylabs/xverse-core';

type GetSelectedAccountProps = {
  selectedAccountType: AccountType;
  selectedAccountIndex: number;
  ledgerAccountsList: Account[];
  softwareAccountsList: Account[];
};

export type AccountWithDetails = Account & {
  btcAddress: string;
  btcPublicKey: string;
  btcAddressType: BtcPaymentType;
  ordinalsAddress: string;
  ordinalsPublicKey: string;
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

  if (account.accountType === 'ledger') {
    return { ...account, ...getAccountAddressDetails(account, 'native'), btcAddressType: 'native' };
  }

  return {
    ...account,
    ...getAccountAddressDetails(account, btcPaymentType),
    btcAddressType: btcPaymentType,
  };
}

const getSelectedAccount = (props: GetSelectedAccountProps): Account | undefined => {
  const { selectedAccountType, selectedAccountIndex, ledgerAccountsList, softwareAccountsList } =
    props;

  const accountList =
    selectedAccountType === 'software'
      ? softwareAccountsList
      : selectedAccountType === 'ledger'
      ? ledgerAccountsList
      : undefined;

  if (!accountList) {
    return undefined;
  }

  const selectedAccount = accountList.find((account) => account.id === selectedAccountIndex);

  return selectedAccount;
};

export default getSelectedAccount;
