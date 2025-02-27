import type {
  Account,
  AccountType,
  BtcPaymentType,
  NetworkType,
  WalletId,
} from '@secretkeylabs/xverse-core';
import { getAccountAddressDetails } from '@secretkeylabs/xverse-core';
import type { SoftwareWallets } from '@stores/wallet/actions/types';

type GetSelectedAccountProps = {
  selectedAccountType: AccountType;
  selectedAccountIndex: number;
  selectedWalletId: WalletId | undefined;
  ledgerAccountsList: Account[];
  keystoneAccountsList: Account[];
  softwareWallets: SoftwareWallets;
  network: NetworkType;
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
    selectedWalletId,
    ledgerAccountsList,
    keystoneAccountsList,
    softwareWallets,
    network,
  } = props;

  let accountList: Account[] | undefined;

  switch (selectedAccountType) {
    case 'software': {
      const softwareWallet = softwareWallets?.[network]?.find(
        (wallet) => wallet.walletId === selectedWalletId,
      );
      accountList = softwareWallet?.accounts;
      break;
    }
    case 'ledger':
      accountList = ledgerAccountsList;
      break;
    case 'keystone':
      accountList = keystoneAccountsList;
      break;
    default:
      return undefined;
  }

  if (!accountList) {
    return undefined;
  }

  const selectedAccount = accountList.find((account) => account.id === selectedAccountIndex);

  return selectedAccount;
};

export default getSelectedAccount;
