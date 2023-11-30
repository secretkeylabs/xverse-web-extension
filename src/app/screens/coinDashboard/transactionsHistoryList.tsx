import BtcTransactionHistoryItem from '@components/transactions/btcTransaction';
import StxTransactionHistoryItem from '@components/transactions/stxTransaction';
import useTransactions from '@hooks/queries/useTransactions';
import { animated, config, useSpring } from '@react-spring/web';
import type { BtcTransactionData } from '@secretkeylabs/xverse-core';
import {
  AddressTransactionWithTransfers,
  MempoolTransaction,
  PostConditionFungible,
} from '@stacks/stacks-blockchain-api-types';
import { CurrencyTypes } from '@utils/constants';
import { formatDate } from '@utils/date';
import {
  isAddressTransactionWithTransfers,
  isBrc20Transaction,
  isBrc20TransactionArr,
  isBtcTransaction,
  isBtcTransactionArr,
  Tx,
} from '@utils/transactions/transactions';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';

const ListItemsContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const ListHeader = styled.h1((props) => ({
  marginTop: props.theme.spacing(20),
  marginBottom: props.theme.spacing(12),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  ...props.theme.headline_s,
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
  marginBottom: props.theme.spacing(8),
}));

const SectionHeader = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: props.theme.spacing(7),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const SectionSeparator = styled.div((props) => ({
  border: `0.5px solid ${props.theme.colors.white_400}`,
  opacity: 0.2,
  flexGrow: 1,
}));

const SectionTitle = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white_200,
  marginRight: props.theme.spacing(4),
}));

interface TransactionsHistoryListProps {
  coin: CurrencyTypes;
  txFilter: string | null;
  brc20Token: string | null;
}

const sortTransactionsByBlockHeight = (transactions: BtcTransactionData[]) =>
  transactions.sort((txA, txB) => {
    if (txB.blockHeight > txA.blockHeight) {
      return 1;
    }
    return -1;
  });

const groupBtcTxsByDate = (
  transactions: BtcTransactionData[],
): { [x: string]: BtcTransactionData[] } => {
  const pendingTransactions: BtcTransactionData[] = [];
  const processedTransactions: { [x: string]: BtcTransactionData[] } = {};

  transactions.forEach((transaction) => {
    const txDate = formatDate(new Date(transaction.seenTime));
    if (transaction.txStatus === 'pending') {
      pendingTransactions.push(transaction);
    } else {
      if (!processedTransactions[txDate]) processedTransactions[txDate] = [transaction];
      else processedTransactions[txDate].push(transaction);

      sortTransactionsByBlockHeight(processedTransactions[txDate]);
    }
  });
  sortTransactionsByBlockHeight(pendingTransactions);
  if (pendingTransactions.length > 0) {
    const result = { Pending: pendingTransactions, ...processedTransactions };
    return result;
  }
  return processedTransactions;
};

const groupedTxsByDateMap = (txs: (AddressTransactionWithTransfers | MempoolTransaction)[]) =>
  txs.reduce(
    (
      all: { [x: string]: (AddressTransactionWithTransfers | Tx)[] },
      transaction: AddressTransactionWithTransfers | Tx,
    ) => {
      const date = formatDate(
        new Date(
          isAddressTransactionWithTransfers(transaction) && transaction.tx?.burn_block_time_iso
            ? transaction.tx.burn_block_time_iso
            : Date.now(),
        ),
      );
      if (!all[date]) {
        all[date] = [transaction];
      } else {
        all[date].push(transaction);
      }
      return all;
    },
    {},
  );

const filterTxs = (
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

export default function TransactionsHistoryList(props: TransactionsHistoryListProps) {
  const { coin, txFilter, brc20Token } = props;
  const { data, isLoading, isFetching, error } = useTransactions(
    (coin as CurrencyTypes) || 'STX',
    brc20Token,
  );
  const styles = useSpring({
    config: { ...config.stiff },
    from: { opacity: 0 },
    to: {
      opacity: 1,
    },
  });

  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });

  const groupedTxs = useMemo(() => {
    if (!data?.length) {
      return;
    }

    if (isBtcTransactionArr(data) || isBrc20TransactionArr(data)) {
      return groupBtcTxsByDate(data);
    }

    if (txFilter && coin === 'FT') {
      const filteredTxs = filterTxs(
        data as (AddressTransactionWithTransfers | MempoolTransaction)[],
        txFilter,
      );
      return groupedTxsByDateMap(filteredTxs);
    }

    return groupedTxsByDateMap(data as (AddressTransactionWithTransfers | MempoolTransaction)[]);
  }, [data, isLoading, isFetching]);

  return (
    <ListItemsContainer>
      <ListHeader>{t('TRANSACTION_HISTORY_TITLE')}</ListHeader>
      {groupedTxs &&
        !isLoading &&
        Object.keys(groupedTxs).map((group) => (
          <GroupContainer key={group} style={styles}>
            <SectionHeader>
              <SectionTitle>{group}</SectionTitle>
              <SectionSeparator />
            </SectionHeader>
            {groupedTxs[group].map((transaction) => {
              if (isBtcTransaction(transaction) || isBrc20Transaction(transaction)) {
                return (
                  <BtcTransactionHistoryItem transaction={transaction} key={transaction.txid} />
                );
              }
              return (
                <StxTransactionHistoryItem
                  transaction={transaction}
                  transactionCoin={coin}
                  key={transaction.tx_id}
                  txFilter={txFilter}
                />
              );
            })}
          </GroupContainer>
        ))}
      {isLoading && (
        <LoadingContainer>
          <MoonLoader color="white" size={20} />
        </LoadingContainer>
      )}
      {!isLoading && !!error && (
        <NoTransactionsContainer>{t('TRANSACTIONS_LIST_ERROR')}</NoTransactionsContainer>
      )}
      {!isLoading && data?.length === 0 && !error && (
        <NoTransactionsContainer>{t('TRANSACTIONS_LIST_EMPTY')}</NoTransactionsContainer>
      )}
    </ListItemsContainer>
  );
}
