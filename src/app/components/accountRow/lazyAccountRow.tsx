import useIntersectionObserver from '@hooks/useIntersectionObserver';
import useWalletSelector from '@hooks/useWalletSelector';
import type { Account } from '@secretkeylabs/xverse-core';
import { getAccountBalanceKey } from '@utils/helper';
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
  const [shouldFetch, setShouldFetch] = useState(false);
  const ref = useRef(null);

  useIntersectionObserver(ref, () => setShouldFetch(true), {});

  useEffect(() => {
    if (
      !shouldFetch ||
      !fetchBalance ||
      !account ||
      getAccountBalanceKey(account) in accountBalances
    ) {
      return;
    }

    fetchBalance(account);
  }, [account, shouldFetch]);

  return (
    <div ref={ref}>
      <AccountRow {...props} />
    </div>
  );
}

export default LazyAccountRow;
