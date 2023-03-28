import styled from 'styled-components';
import { BtcTransactionData } from '@secretkeylabs/xverse-core/types';
import { CurrencyTypes } from '@utils/constants';
import useTransactions from '@hooks/queries/useTransactions';
import { MoonLoader } from 'react-spinners';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@utils/date';
import {
  AddressTransactionWithTransfers,
  MempoolTransaction,
} from '@stacks/stacks-blockchain-api-types';
import { useMemo } from 'react';
import {
  animated, config, useSpring,
} from '@react-spring/web';
import {
  isAddressTransactionWithTransfers,
  isBtcTransaction,
  isBtcTransactionArr,
  Tx,
} from '@utils/transactions/transactions';
import BtcTransactionHistoryItem from '@components/transactions/btcTransaction';
import StxTransactionHistoryItem from '@components/transactions/stxTransaction';

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
  color: props.theme.colors.white[400],
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

const SectionSeparator = styled.div({
  border: '0.5px solid  rgba(255, 255, 255, 0.6)',
  opacity: 0.2,
  flexGrow: 1,
});

const SectionTitle = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white[200],
  marginRight: props.theme.spacing(4),
}));

interface TransactionsHistoryListProps {
  coin: CurrencyTypes;
  txFilter: string | null;
}

const groupBtcTxsByDate = (
  transactions: BtcTransactionData[],
): { [x: string]: BtcTransactionData[] } => transactions.reduce(
  (all: { [x: string]: BtcTransactionData[] }, transaction: BtcTransactionData) => {
    const txDate = formatDate(new Date(transaction.seenTime));
    if (!all[txDate]) {
      if (transaction.txStatus === 'pending') {
        all.Pending = [transaction];
      } else {
        all[txDate] = [transaction];
      }
    } else {
      all[txDate].push(transaction);
      all[txDate].sort((txA, txB) => {
        if (txB.blockHeight > txA.blockHeight) {
          return 1;
        } return -1;
      });
    }
    return all;
  },
  {},
);

const groupedTxsByDateMap = (txs: (AddressTransactionWithTransfers | MempoolTransaction)[]) => txs.reduce(
  (
    all: { [x: string]: (AddressTransactionWithTransfers | Tx)[] },
    transaction: AddressTransactionWithTransfers | Tx,
  ) => {
    const date = formatDate(
      new Date(
        transaction.tx?.burn_block_time_iso ? transaction.tx.burn_block_time_iso : Date.now(),
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
): (AddressTransactionWithTransfers | MempoolTransaction)[] => txs.filter((atx) => {
  const tx = isAddressTransactionWithTransfers(atx) ? atx.tx : atx;
  const acceptedTypes = tx.tx_type === 'contract_call';
  return (
    acceptedTypes
      && ((atx?.ft_transfers || []).filter((transfer) => transfer.asset_identifier.includes(filter))
        .length > 0
        || (atx?.nft_transfers || []).filter((transfer) => transfer.asset_identifier.includes(filter))
          .length > 0
        || tx?.contract_call?.contract_id === filter)
  );
});

export default function TransactionsHistoryList(props: TransactionsHistoryListProps) {
  const { coin, txFilter } = props;
  const { data, isLoading, isFetching } = useTransactions((coin as CurrencyTypes) || 'STX');
  const styles = useSpring({
    config: { ...config.stiff },
    from: { opacity: 0 },
    to: {
      opacity: 1,
    },
  });
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });

  const groupedTxs = useMemo(() => {
    if (data && data.length > 0) {
      if (isBtcTransactionArr(data)) {
        return groupBtcTxsByDate(data);
      }
      if (txFilter && coin === 'FT') {
        const filteredTxs = filterTxs(data, txFilter);
        return groupedTxsByDateMap(filteredTxs);
      }
      return groupedTxsByDateMap(data);
    }
  }, [data, isLoading, isFetching]);
  return (
    <ListItemsContainer>
      <ListHeader>{t('TRANSACTION_HISTORY_TITLE')}</ListHeader>
      {groupedTxs
        && !isLoading
        && Object.keys(groupedTxs).map((group) => (
          <GroupContainer style={styles}>
            <SectionHeader>
              <SectionTitle>{group}</SectionTitle>
              <SectionSeparator />
            </SectionHeader>
            {groupedTxs[group].map((transaction) => {
              if (isBtcTransaction(transaction)) {
                return (
                  <BtcTransactionHistoryItem transaction={transaction} key={transaction.txid} />
                );
              }
              return (
                <StxTransactionHistoryItem
                  transaction={transaction}
                  transactionCoin={coin}
                  key={transaction.tx_id}
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
      {!isLoading && data?.length === 0 && (
        <NoTransactionsContainer>{t('TRANSACTIONS_LIST_EMPTY')}</NoTransactionsContainer>
      )}
    </ListItemsContainer>
  );
}
