import BtcOrBrc20TransactionHistoryItem from '@components/transactions/btcOrBrc20Transaction';
import RuneTransactionHistoryItem from '@components/transactions/RuneTransaction';
import StxTransactionHistoryItem from '@components/transactions/stxTransaction';
import useBtcClient from '@hooks/apiClients/useBtcClient';
import useTransactions from '@hooks/queries/useTransactions';
import useSeedVault from '@hooks/useSeedVault';
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
import { formatDate } from '@utils/date';
import { isLedgerAccount } from '@utils/helper';
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

const groupRuneTxsByDate = (
  transactions: GetRunesActivityForAddressEvent[],
): Record<string, GetRunesActivityForAddressEvent[]> => {
  const mappedTransactions = {};
  transactions.forEach((transaction) => {
    const txDate = formatDate(new Date(transaction.blockTimestamp));
    if (!mappedTransactions[txDate]) {
      mappedTransactions[txDate] = [transaction];
    } else {
      mappedTransactions[txDate].push(transaction);
    }
  });
  return mappedTransactions;
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
  const seedVault = useSeedVault();
  const { data, isLoading, isFetching, error } = useTransactions(
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
          isLedgerAccount(selectedAccount) && selectedAccount.deviceAccountIndex
            ? selectedAccount.deviceAccountIndex
            : selectedAccount.id,
        network: network.type,
        esploraProvider: btcClient,
        getSeedPhrase: seedVault.getSeed,
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
  }, [data, isLoading, isFetching]);

  return (
    <ListItemsContainer>
      {withTitle && <ListHeader>{t('TRANSACTION_HISTORY_TITLE')}</ListHeader>}
      {groupedTxs &&
        !isLoading &&
        Object.keys(groupedTxs).map((group) => (
          <GroupContainer key={group} style={styles}>
            <SectionHeader>
              <SectionTitle>{group}</SectionTitle>
              <SectionSeparator />
            </SectionHeader>
            {groupedTxs[group].map((transaction) => {
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
