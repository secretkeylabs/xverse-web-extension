import styled from 'styled-components';
import { BtcTransactionData, FungibleToken, StxTransactionData } from '@secretkeylabs/xverse-core/types';
import { CurrencyTypes } from '@utils/constants';
import useTransactions from '@hooks/useTransactions';
import { Ring } from 'react-spinners-css';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@utils/date';
import { useMemo } from 'react';
import TransactionHistoryItem from './transactionHistoryItem';

const ListItemsContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const ListHeader = styled.h1((props) => ({
  marginTop: props.theme.spacing(20),
  marginBottom: props.theme.spacing(12),
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
  justifyContent: 'center',
  alignItems: 'center',
  color: props.theme.colors.white[400],
}));
const SectionHeader = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: props.theme.spacing(12),
}));

const SectionSeparator = styled.div((props) => ({
  border: `1px solid ${props.theme.colors.white[400]}`,
  flexGrow: 1,
}));

const SectionTitle = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white[200],
  marginRight: props.theme.spacing(4),
}));

interface TransactionsHistoryListProps {
  coin: CurrencyTypes,
  fungibleToken?: FungibleToken;
}

const groupTxByDate = (
  transactions: StxTransactionData[] | BtcTransactionData[],
): { [x: string]: (StxTransactionData | BtcTransactionData)[] } => transactions.reduce(
  (
    all: { [x: string]: (StxTransactionData | BtcTransactionData)[] },
    transaction: StxTransactionData | BtcTransactionData,
  ) => {
    const txDate = formatDate(transaction.seenTime);
    if (!all[txDate]) {
      if (transaction.txStatus === 'pending') {
        all.Pending = [transaction];
      } else {
        all[txDate] = [transaction];
      }
    } else {
      all[txDate].push(transaction);
    }
    return all;
  },
  {},
);

export default function TransactionsHistoryList(props: TransactionsHistoryListProps) {
  const {
    coin,
    fungibleToken,
  } = props;
  const {
    data,
    isLoading,
  } = useTransactions(coin as CurrencyTypes || 'STX', fungibleToken);
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const groupedTxs = useMemo(() => data && groupTxByDate(data), [data, isLoading]);
  return (
    <ListItemsContainer>
      <ListHeader>{t('TRANSACTION_HISTORY_TITLE')}</ListHeader>
      {groupedTxs
        && !isLoading
        && Object.keys(groupedTxs).map((group) => (
          <>
            <SectionHeader>
              <SectionTitle>{group}</SectionTitle>
              <SectionSeparator />
            </SectionHeader>
            {groupedTxs[group].map((transaction) => (
              <TransactionHistoryItem
                transaction={transaction}
                key={transaction.txid}
                transactionCoin={coin}
              />
            ))}
          </>
        ))}
      {isLoading && (
        <LoadingContainer>
          <Ring color="white" size={20} />
        </LoadingContainer>
      )}
      {!isLoading && data?.length === 0 && (
        <NoTransactionsContainer>{t('TRANSACTIONS_LIST_EMPTY')}</NoTransactionsContainer>
      )}
    </ListItemsContainer>
  );
}
