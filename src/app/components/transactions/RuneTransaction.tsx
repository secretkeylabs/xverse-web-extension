import useWalletSelector from '@hooks/useWalletSelector';
import type { GetRunesActivityForAddressEvent } from '@secretkeylabs/xverse-core';
import { ftDecimals, getBtcTxStatusUrl } from '@utils/helper';
import { useCallback } from 'react';
import styled from 'styled-components';
import TransactionAmount from './transactionAmount';
import TransactionRecipient from './transactionRecipient';
import TransactionStatusIcon from './transactionStatusIcon';
import TransactionTitle from './transactionTitle';

const TransactionContainer = styled.button((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: props.theme.spacing(5),
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  background: 'none',
  ':hover': {
    background: props.theme.colors.white_900,
  },
  ':focus': {
    background: props.theme.colors.white_850,
  },
}));

const TransactionAmountContainer = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  flex: 1,
});

const TransactionInfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.space.s,
  flex: 1,
}));

const TransactionRow = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  ...props.theme.typography.body_bold_m,
}));

interface RuneTransactionHistoryItemProps {
  transaction: GetRunesActivityForAddressEvent;
  runeSymbol: string;
  runeDecimals: number;
}
export default function RuneTransactionHistoryItem({
  transaction,
  runeSymbol,
  runeDecimals,
}: RuneTransactionHistoryItemProps) {
  const { network } = useWalletSelector();
  const currency = 'FT';
  const protocol = 'runes';

  const openBtcTxStatusLink = useCallback(() => {
    window.open(getBtcTxStatusUrl(transaction.txid, network), '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <TransactionContainer data-testid="transaction-container" onClick={openBtcTxStatusLink}>
      <TransactionStatusIcon transaction={transaction} currency={currency} protocol={protocol} />
      <TransactionInfoContainer>
        <TransactionRow>
          <div>
            <TransactionTitle transaction={transaction} />
            <TransactionRecipient transaction={transaction} />
          </div>
          <TransactionAmountContainer data-testid="transaction-amount">
            <TransactionAmount
              transaction={{ ...transaction, amount: ftDecimals(transaction.amount, runeDecimals) }}
              currency={currency}
              protocol={protocol}
              tokenSymbol={runeSymbol}
            />
          </TransactionAmountContainer>
        </TransactionRow>
      </TransactionInfoContainer>
    </TransactionContainer>
  );
}
