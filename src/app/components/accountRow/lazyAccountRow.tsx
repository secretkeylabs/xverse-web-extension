import useIntersectionObserver from '@hooks/useIntersectionObserver';
import useWalletSelector from '@hooks/useWalletSelector';
import type { Account } from '@secretkeylabs/xverse-core';
import { useEffect, useRef, useState } from 'react';
import AccountRow from '.';

type Props = {
  account: Account | null;
  isSelected: boolean;
  onAccountSelected: (account: Account, goBack?: boolean) => void;
  isAccountListView?: boolean;
  disabledAccountSelect?: boolean;
  fetchBalance?: (account: Account | null) => void;
};

function LazyAccountRow(props: Props) {
  const { fetchBalance, account } = props;
  const { accountBalances } = useWalletSelector();
  const totalBalance = accountBalances[account?.btcAddress ?? ''];
  const [shouldFetch, setShouldFetch] = useState(false);
  const ref = useRef(null);

  useIntersectionObserver(ref, () => setShouldFetch(true), {});

  useEffect(() => {
    if (fetchBalance && shouldFetch && !totalBalance) {
      fetchBalance(account);
    }
  }, [shouldFetch, totalBalance]);

  return (
    <div ref={ref}>
      <AccountRow {...props} />
    </div>
  );
}

export default LazyAccountRow;
