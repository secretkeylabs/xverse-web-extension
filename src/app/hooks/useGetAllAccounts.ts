import type { Account, WalletId } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletSelector from './useWalletSelector';

export default function useGetAllAccounts(): (Account & { walletId?: WalletId })[] {
  const { network, softwareWallets, ledgerAccountsList, keystoneAccountsList } =
    useWalletSelector();

  return useMemo(() => {
    const softwareAccounts = softwareWallets[network.type].flatMap((wallet) => wallet.accounts);

    return [...ledgerAccountsList, ...keystoneAccountsList, ...softwareAccounts];
  }, [network.type, softwareWallets, ledgerAccountsList, keystoneAccountsList]);
}
