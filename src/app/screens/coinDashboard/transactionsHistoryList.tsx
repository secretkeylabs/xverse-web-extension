import BtcOrBrc20TransactionHistoryItem from '@components/transactions/btcOrBrc20Transaction';
import RuneTransactionHistoryItem from '@components/transactions/RuneTransaction';
import StxTransactionHistoryItem from '@components/transactions/stxTransaction';
import useBtcClient from '@hooks/apiClients/useBtcClient';
import useTransactions from '@hooks/queries/useTransactions';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { animated, config, useSpring } from '@react-spring/web';
import type {
  BtcTransactionData,
  GetRunesActivityForAddressEvent,
} from '@secretkeylabs/xverse-core';
import type {
  AddressTransactionWithTransfers,
  MempoolTransaction,
  PostConditionFungible,
} from '@stacks/stacks-blockchain-api-types';
import Spinner from '@ui-library/spinner';
import type { CurrencyTypes } from '@utils/constants';
import { formatDate, formatDateKey } from '@utils/date';
import { isKeystoneAccount, isLedgerAccount } from '@utils/helper';
import {
  isAddressTransactionWithTransfers,
  isBrc20Transaction,
  isBrc20TransactionArr,
  isBtcTransaction,
  isBtcTransactionArr,
  isRuneTransaction,
  isRuneTransactionArr,
  type Tx,
} from '@utils/transactions/transactions';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ListItemsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.space.l,
}));

const ListHeader = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  margin: props.theme.space.m,
  marginTop: 0,
  marginBottom: props.theme.space.l,
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

const SectionHeader = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: props.theme.spacing(7),
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
}));

const SectionSeparator = styled.div((props) => ({
  border: `0.5px solid ${props.theme.colors.white_400}`,
  opacity: 0.2,
  flexGrow: 1,
}));

const SectionTitle = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white_200,
  marginRight: props.theme.space.xs,
}));

const groupBtcTxsByDate = (
  transactions: BtcTransactionData[],
): [Date, string, BtcTransactionData[]][] => {
  const pendingTransactions: BtcTransactionData[] = [];
  const processedTransactions: { [x: string]: BtcTransactionData[] } = {};

  transactions.forEach((transaction) => {
    if (transaction.txStatus === 'pending') {
      pendingTransactions.push(transaction);
    } else {
      const txDateKey = formatDateKey(new Date(transaction.seenTime));
      if (!processedTransactions[txDateKey]) {
        processedTransactions[txDateKey] = [];
      }
      processedTransactions[txDateKey].push(transaction);
    }
  });

  const result: [Date, string, BtcTransactionData[]][] = [];

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
      return txB.txid.localeCompare(txA.txid);
    });

    result.push([new Date(grp[0].seenTime), formatDate(new Date(grp[0].seenTime)), grp]);
  });

  result.sort((a, b) => b[0].getTime() - a[0].getTime());

  return result;
};

const groupRuneTxsByDate = (
  transactions: GetRunesActivityForAddressEvent[],
): [Date, string, GetRunesActivityForAddressEvent[]][] => {
  const processedTransactions: { [x: string]: GetRunesActivityForAddressEvent[] } = {};

  transactions.forEach((transaction) => {
    const txDateKey = formatDateKey(new Date(transaction.blockTimestamp));
    if (!processedTransactions[txDateKey]) {
      processedTransactions[txDateKey] = [];
    }
    processedTransactions[txDateKey].push(transaction);
  });

  const result: [Date, string, GetRunesActivityForAddressEvent[]][] = [];

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
      return txB.txid.localeCompare(txA.txid);
    });

    result.push([
      new Date(grp[0].blockTimestamp),
      formatDate(new Date(grp[0].blockTimestamp)),
      grp,
    ]);
  });

  result.sort((a, b) => b[0].getTime() - a[0].getTime());

  return result;
};

const groupedTxsByDateMap = (
  transactions: (AddressTransactionWithTransfers | MempoolTransaction)[],
): [Date, string, (AddressTransactionWithTransfers | Tx)[]][] => {
  const getBlockTimestamp = (tx: AddressTransactionWithTransfers | Tx): Date => {
    let dateStr: string;

    if (isAddressTransactionWithTransfers(tx)) {
      dateStr = tx.tx.burn_block_time_iso;
    } else if ('receipt_time_iso' in tx) {
      dateStr = tx.receipt_time_iso;
    } else {
      dateStr = '';
    }

    return dateStr ? new Date(dateStr) : new Date();
  };

  const getTxid = (tx: AddressTransactionWithTransfers | Tx): string => {
    if (isAddressTransactionWithTransfers(tx)) {
      return tx.tx.tx_id;
    }
    return tx.tx_id;
  };

  const processedTransactions: { [x: string]: (AddressTransactionWithTransfers | Tx)[] } = {};

  transactions.forEach((transaction) => {
    const txDate = getBlockTimestamp(transaction);
    const txDateKey = formatDateKey(txDate);

    if (!processedTransactions[txDateKey]) {
      processedTransactions[txDateKey] = [];
    }
    processedTransactions[txDateKey].push(transaction);
  });

  const result: [Date, string, (AddressTransactionWithTransfers | Tx)[]][] = [];

  Object.values(processedTransactions).forEach((grp) => {
    if (grp.length === 0) {
      return;
    }

    grp.sort((txA, txB) => {
      // sort by block height first
      const blockHeightDiff = getBlockTimestamp(txB).getTime() - getBlockTimestamp(txA).getTime();
      if (blockHeightDiff !== 0) {
        return blockHeightDiff;
      }

      // if block height is the same, sort by txid for consistency
      return getTxid(txB).localeCompare(getTxid(txA));
    });

    result.push([getBlockTimestamp(grp[0]), formatDate(new Date(getBlockTimestamp(grp[0]))), grp]);
  });

  result.sort((a, b) => b[0].getTime() - a[0].getTime());

  return result;
};

const filterStxTxs = (
  txs: (AddressTransactionWithTransfers | MempoolTransaction)[],
  filter: string,
): (AddressTransactionWithTransfers | MempoolTransaction)[] =>
  txs.filter((atx) => {
    const tx = isAddressTransactionWithTransfers(atx) ? atx.tx : atx;
    const acceptedTypes = tx.tx_type === 'contract_call';
    const ftTransfers = atx && isAddressTransactionWithTransfers(atx) ? atx.ft_transfers || [] : [];
    const nftTransfers =
      atx && isAddressTransactionWithTransfers(atx) ? atx.nft_transfers || [] : [];
    const fungibleTokenPostCondition = tx?.post_conditions[0] as PostConditionFungible;
    const contractFromPostCondition = `${fungibleTokenPostCondition?.asset?.contract_address}.${fungibleTokenPostCondition?.asset?.contract_name}::${fungibleTokenPostCondition?.asset?.asset_name}`;
    return (
      acceptedTypes &&
      (ftTransfers.filter((transfer) => transfer.asset_identifier.includes(filter)).length > 0 ||
        nftTransfers.filter((transfer) => transfer.asset_identifier.includes(filter)).length > 0 ||
        tx?.contract_call?.contract_id === filter ||
        (contractFromPostCondition && contractFromPostCondition === filter))
    );
  });

type Props = {
  coin: CurrencyTypes;
  stxTxFilter: string | null;
  brc20Token: string | null;
  runeToken: string | null;
  runeSymbol: string | null;
  withTitle?: boolean;
};

function TransactionsHistoryList({
  coin,
  stxTxFilter,
  brc20Token,
  runeToken,
  runeSymbol,
  withTitle = true,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const selectedAccount = useSelectedAccount();
  const { network, selectedAccountType } = useWalletSelector();
  const btcClient = useBtcClient();
  const { data, isLoading, error } = useTransactions(
    (coin as CurrencyTypes) || 'STX',
    brc20Token,
    runeToken,
  );
  const runeDecimals = data && isRuneTransactionArr(data) ? data.divisibility : null;
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

  const groupedTxs = useMemo(() => {
    if (!data) {
      return;
    }
    if (!isRuneTransactionArr(data) && !data.length) {
      return;
    }
    if (isRuneTransactionArr(data)) {
      return groupRuneTxsByDate(data.items);
    }
    if (isBtcTransactionArr(data) || isBrc20TransactionArr(data)) {
      return groupBtcTxsByDate(data);
    }
    if (stxTxFilter && coin === 'FT') {
      const filteredTxs = filterStxTxs(
        data as (AddressTransactionWithTransfers | MempoolTransaction)[],
        stxTxFilter,
      );
      return groupedTxsByDateMap(filteredTxs);
    }
    return groupedTxsByDateMap(data as (AddressTransactionWithTransfers | MempoolTransaction)[]);
  }, [data, coin, stxTxFilter]);

  return (
    <ListItemsContainer>
      {withTitle && <ListHeader>{t('TRANSACTION_HISTORY_TITLE')}</ListHeader>}
      {groupedTxs &&
        !isLoading &&
        groupedTxs.map(([, group, items]) => (
          <GroupContainer key={group} style={styles}>
            <SectionHeader>
              <SectionTitle>{group}</SectionTitle>
              <SectionSeparator />
            </SectionHeader>
            {items.map((transaction) => {
              if (wallet && isRuneTransaction(transaction)) {
                return (
                  <RuneTransactionHistoryItem
                    transaction={transaction}
                    runeSymbol={runeSymbol ?? ''}
                    runeDecimals={runeDecimals ?? 0}
                    key={transaction.txid}
                  />
                );
              }
              if (wallet && (isBtcTransaction(transaction) || isBrc20Transaction(transaction))) {
                return (
                  <BtcOrBrc20TransactionHistoryItem
                    transaction={transaction}
                    wallet={wallet}
                    key={`${transaction.txid}:${transaction.incoming}:${transaction.txType}`}
                  />
                );
              }
              if (stxTxFilter) {
                return (
                  <StxTransactionHistoryItem
                    transaction={transaction}
                    transactionCoin={coin}
                    key={transaction.tx_id}
                    txFilter={stxTxFilter}
                  />
                );
              }
              return (
                <StxTransactionHistoryItem
                  transaction={transaction}
                  transactionCoin={coin}
                  key={transaction.tx_id}
                  txFilter={stxTxFilter}
                />
              );
            })}
          </GroupContainer>
        ))}
      {isLoading && (
        <LoadingContainer>
          <Spinner color="white" size={20} />
        </LoadingContainer>
      )}
      {!isLoading && !!error && (
        <NoTransactionsContainer>{t('TRANSACTIONS_LIST_ERROR')}</NoTransactionsContainer>
      )}
      {!isLoading &&
        !error &&
        data &&
        ((isRuneTransactionArr(data) && data.items.length === 0) ||
          (!isRuneTransactionArr(data) && data.length === 0)) && (
          <NoTransactionsContainer>{t('TRANSACTIONS_LIST_EMPTY')}</NoTransactionsContainer>
        )}
    </ListItemsContainer>
  );
}

export default TransactionsHistoryList;
