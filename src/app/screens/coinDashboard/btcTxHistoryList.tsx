import BtcTxHistoryItem from '@components/transactions/btc/btcTxHistoryItem';
import BtcOrBrc20TransactionHistoryItem from '@components/transactions/btcOrBrc20Transaction';
import useBtcClient from '@hooks/apiClients/useBtcClient';
import useBtcTxHistory from '@hooks/queries/useBtcTxHistory';
import useTransactions from '@hooks/queries/useTransactions';
import useGetAllAccounts from '@hooks/useGetAllAccounts';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { animated, config, useSpring } from '@react-spring/web';
import type { BtcTransactionData, EnhancedTx } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Spinner from '@ui-library/spinner';
import { formatDate, formatDateKey } from '@utils/date';
import { getAccountName, isKeystoneAccount, isLedgerAccount } from '@utils/helper';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ListItemsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.space.l,
}));

const LoadingContainer = styled.div({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const NoTransactionsContainer = styled.div((props) => ({
  ...props.theme.body_m,
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  color: props.theme.colors.white_400,
}));

const GroupContainer = styled(animated.div)((props) => ({
  marginBottom: props.theme.space.m,
}));

const SectionTitle = styled.p((props) => ({
  ...props.theme.headline_category_m,
  color: props.theme.colors.white_200,
  marginRight: props.theme.space.xs,
  marginBottom: props.theme.space.xs,
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  textTransform: 'uppercase',
}));

const LoadMoreButtonContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: props.theme.space.xl,
  marginTop: props.theme.space.xl,
  button: {
    width: 156,
  },
}));

const groupBtcTxsByDate = (
  transactions: (BtcTransactionData | EnhancedTx)[],
): [Date, string, (BtcTransactionData | EnhancedTx)[]][] => {
  const pendingTransactions: BtcTransactionData[] = [];
  const processedTransactions: { [x: string]: EnhancedTx[] } = {};

  transactions.forEach((transaction) => {
    if ('txStatus' in transaction && transaction.txStatus === 'pending') {
      return pendingTransactions.push(transaction);
    }

    if ('blockTime' in transaction) {
      const txDateKey = formatDateKey(new Date(transaction.blockTime * 1000));
      if (!processedTransactions[txDateKey]) {
        processedTransactions[txDateKey] = [];
      }
      processedTransactions[txDateKey].push(transaction);
    }
  });

  const result: [Date, string, (BtcTransactionData | EnhancedTx)[]][] = [];

  if (pendingTransactions.length > 0) {
    result.push([new Date(), 'Pending', pendingTransactions]);
  }

  Object.values(processedTransactions).forEach((grp) => {
    if (grp.length === 0) {
      return;
    }

    grp.sort((txA, txB) => {
      // sort by block height first
      const blockHeightDiff = txB.blockHeight - txA.blockHeight;
      if (blockHeightDiff !== 0) {
        return blockHeightDiff;
      }

      // if block height is the same, sort by txid for consistency
      return txB.id.localeCompare(txA.id);
    });

    result.push([
      new Date(grp[0].blockTime * 1000),
      formatDate(new Date(grp[0].blockTime * 1000)),
      grp,
    ]);
  });

  result.sort((a, b) => b[0].getTime() - a[0].getTime());

  return result;
};

function BtcTxHistoryList() {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const { t: nftDashboard } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const selectedAccount = useSelectedAccount();
  const { network, selectedAccountType } = useWalletSelector();
  const accountsList = useGetAllAccounts();

  const btcClient = useBtcClient();
  const {
    data: mempoolData,
    isLoading: mempoolLoading,
    error: mempoolError,
  } = useTransactions('BTC', null, null);
  const {
    data: btcTxHistoryData,
    isLoading: btcTxHistoryLoading,
    error: btcTxHistoryError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useBtcTxHistory();

  const isLoading = mempoolLoading || btcTxHistoryLoading;
  const error = mempoolError || btcTxHistoryError;
  const data = [
    ...(mempoolData ? (mempoolData as BtcTransactionData[]) : []),
    ...(btcTxHistoryData?.pages ? btcTxHistoryData.pages.flatMap((page) => page.transactions) : []),
  ];

  const styles = useSpring({
    config: { ...config.stiff },
    from: { opacity: 0 },
    to: {
      opacity: 1,
    },
  });

  const wallet = selectedAccount
    ? {
        ...selectedAccount,
        accountType: selectedAccountType || 'software',
        accountId:
          (isLedgerAccount(selectedAccount) || isKeystoneAccount(selectedAccount)) &&
          selectedAccount.deviceAccountIndex !== undefined
            ? selectedAccount.deviceAccountIndex
            : selectedAccount.id,
        network: network.type,
        esploraProvider: btcClient,
      }
    : undefined;

  const groupedTxs = useMemo(() => groupBtcTxsByDate(data), [data.length]);

  // add address book to dictionary when ready
  const walletAddressesDictionary = useMemo(() => {
    const dictionary = new Map<string, string>();

    accountsList.forEach((account) => {
      const accountName = getAccountName(account, tCommon);

      dictionary.set(account.btcAddresses.taproot.address, accountName);
      if (account.btcAddresses.nested) {
        dictionary.set(account.btcAddresses.nested.address, accountName);
      }
      if (account.btcAddresses.native) {
        dictionary.set(account.btcAddresses.native.address, accountName);
      }
    });

    return dictionary;
  }, [accountsList.length, t]);

  return (
    <ListItemsContainer>
      {groupedTxs && !isLoading && (
        <>
          {groupedTxs.map(([, group, items]) => (
            <GroupContainer key={group} style={styles}>
              <SectionTitle>{group}</SectionTitle>
              {items.map((transaction) => {
                if (wallet && 'txStatus' in transaction) {
                  return (
                    <BtcOrBrc20TransactionHistoryItem
                      transaction={transaction}
                      wallet={wallet}
                      key={`${transaction.txid}:${transaction.incoming}:${transaction.txType}`}
                    />
                  );
                }
                if ('blockTime' in transaction) {
                  return (
                    <BtcTxHistoryItem
                      key={transaction.id}
                      tx={transaction}
                      walletAddressesDictionary={walletAddressesDictionary}
                      networkType={network.type}
                    />
                  );
                }
                return null;
              })}
            </GroupContainer>
          ))}
          {hasNextPage && (
            <LoadMoreButtonContainer>
              <Button
                variant="secondary"
                title={nftDashboard('LOAD_MORE')}
                loading={isFetchingNextPage}
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              />
            </LoadMoreButtonContainer>
          )}
        </>
      )}
      {isLoading && (
        <LoadingContainer>
          <Spinner color="white" size={20} />
        </LoadingContainer>
      )}
      {!isLoading && !!error && (
        <NoTransactionsContainer>{t('TRANSACTIONS_LIST_ERROR')}</NoTransactionsContainer>
      )}
      {!isLoading && !error && data.length === 0 && (
        <NoTransactionsContainer>{t('TRANSACTIONS_LIST_EMPTY')}</NoTransactionsContainer>
      )}
    </ListItemsContainer>
  );
}

export default BtcTxHistoryList;
