import { Account, AccountType } from '@secretkeylabs/xverse-core';

type GetSelectedAccountProps = {
  selectedAccountType: AccountType;
  selectedAccountIndex: number;
  ledgerAccountsList: Account[];
  softwareAccountsList: Account[];
};

const getSelectedAccount = (props: GetSelectedAccountProps) => {
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
