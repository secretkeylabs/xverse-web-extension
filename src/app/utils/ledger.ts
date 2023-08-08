import { Account, getMasterFingerPrint } from '@secretkeylabs/xverse-core';
import { Transport } from '@secretkeylabs/xverse-core/ledger/types';

// eslint-disable-next-line import/prefer-default-export
export const findLedgerAccountId = async ({
  transport,
  selectedAccount,
  ledgerAccountsList,
}: {
  transport: Transport;
  selectedAccount: Account | null;
  ledgerAccountsList: Account[];
}): Promise<number> => {
  if (!selectedAccount) {
    return -1;
  }

  const masterFingerPrint = await getMasterFingerPrint(transport);

  const deviceAccounts = ledgerAccountsList.filter(
    (account) => account.masterPubKey === masterFingerPrint,
  );
  const accountId = deviceAccounts.findIndex((account) => account.id === selectedAccount.id);

  return accountId;
};
