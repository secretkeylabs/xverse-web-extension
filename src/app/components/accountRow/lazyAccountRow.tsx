import useIntersectionObserver from '@hooks/useIntersectionObserver';
import { useStore } from '@hooks/useStore';
import useWalletSelector from '@hooks/useWalletSelector';
import type { Account, WalletId } from '@secretkeylabs/xverse-core';
import { useEffect, useRef, useState } from 'react';
import AccountRow from '.';

type Props = {
  walletId?: WalletId;
  account: Account;
  isSelected: boolean;
  onAccountSelected: (account: Account, goBack?: boolean) => void;
  isAccountListView?: boolean;
  disabledAccountSelect?: boolean;
  fetchBalance?: (account: Account | null) => void;
};

function LazyAccountRow(props: Props) {
  const { fetchBalance, account } = props;
  const [shouldFetch, setShouldFetch] = useState(false);
  const ref = useRef(null);
  const { network } = useWalletSelector();
  const accountBalanceStore = useStore(
    'accountBalances',
    (store, utils) =>
      store[utils.getAccountStorageKey(account, network.type)] as string | undefined,
  );

  useIntersectionObserver(ref, () => setShouldFetch(true), {});

  useEffect(() => {
    if (!shouldFetch || !fetchBalance || accountBalanceStore.data) {
      return;
    }

    fetchBalance(account);
  }, [account, shouldFetch, accountBalanceStore.data]);

  return (
    <div ref={ref}>
      <AccountRow {...props} />
    </div>
  );
}

export default LazyAccountRow;
